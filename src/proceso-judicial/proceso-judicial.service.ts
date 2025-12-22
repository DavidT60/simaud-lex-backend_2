import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProcesoJudicial } from "./proceso-judicial.entity";
import { Sentencia } from "./sentencia.entity";
import { CreateProcesoJudicialDto } from "./dto/create-proceso-judicial.dto";
import { UpdateProcesoJudicialDto } from "./dto/update-proceso-judicial.dto";
import { SimulateSentenciaDto } from "./dto/simulate-sentencia.dto";
import { HechosSimulacion } from "./hechos-simulacion.entity";
import { MotorInferenciaService } from "../motor-inferencia/motor-inferencia.service";
import { Nna } from "../nna/nna.entity";
import { EstadoProceso, RolParte } from "./enums/proceso.enums";

@Injectable()
export class ProcesoJudicialService {
  constructor(
    @InjectRepository(ProcesoJudicial)
    private readonly procesoRepository: Repository<ProcesoJudicial>,
    @InjectRepository(Nna)
    private readonly nnaRepository: Repository<Nna>,
    @InjectRepository(HechosSimulacion)
    private readonly hechosSimulacionRepository: Repository<HechosSimulacion>,
    @InjectRepository(Sentencia)
    private readonly sentenciaRepository: Repository<Sentencia>,
    private readonly motorInferenciaService: MotorInferenciaService
  ) {}

  async create(createDto: CreateProcesoJudicialDto): Promise<ProcesoJudicial> {
    const nna = await this.nnaRepository.findOne({
      where: { id: createDto.nnaId },
    });
    if (!nna) {
      throw new NotFoundException(`NNA with ID ${createDto.nnaId} not found`);
    }

    const proceso = this.procesoRepository.create({
      ...createDto,
      nna,
    });
    return this.procesoRepository.save(proceso);
  }

  findAll(): Promise<ProcesoJudicial[]> {
    return this.procesoRepository.find({
      relations: ["nna", "partes", "partes.persona"],
    });
  }

  async findOne(id: string): Promise<ProcesoJudicial> {
    const proceso = await this.procesoRepository.findOne({
      where: { id },
      relations: [
        "nna",
        "partes",
        "partes.persona",
        "obligaciones",
        "regimenesVisita",
        "sentencia",
      ],
    });
    if (!proceso) {
      throw new NotFoundException(`ProcesoJudicial with ID ${id} not found`);
    }
    return proceso;
  }

  async update(
    id: string,
    updateDto: UpdateProcesoJudicialDto
  ): Promise<ProcesoJudicial> {
    const proceso = await this.findOne(id);
    this.procesoRepository.merge(proceso, updateDto);
    return this.procesoRepository.save(proceso);
  }

  async remove(id: string): Promise<void> {
    const proceso = await this.findOne(id);
    await this.procesoRepository.remove(proceso);
  }

  async generarSimulacionSentencia(
    id: string,
    simulateDto: SimulateSentenciaDto
  ): Promise<any> {
    const proceso = await this.findOne(id);
    console.log("Proceso encontrado para simulación:", proceso);

    // Guardar los hechos de la simulación en la base de datos
    const hechosSimulacion = this.hechosSimulacionRepository.create({
      proceso,
      ...simulateDto,
    });
    console.log(hechosSimulacion);

    console.log("Guardando hechos de simulación...");
    let hechosSimulacionSaved =
      await this.hechosSimulacionRepository.save(hechosSimulacion);

    // 1. MOTOR DE RAZONAMIENTO (Con integración LLM)
    console.log("Procesando caso con motor de inferencia...");
    const nnaNombre = proceso.nna
      ? proceso.nna.nombre_completo
      : "Menor involucrado";
    const resultadoMotor = await this.motorInferenciaService.procesarCaso(
      simulateDto,
      nnaNombre
    );

    // 2. GUARDAR SENTENCIA EN BASE DE DATOS
    let sentencia = await this.sentenciaRepository.findOne({
      where: { proceso: { id: proceso.id } },
    });

    if (!sentencia) {
      console.log(`Creating Setence..... ${proceso.id}`);
      sentencia = this.sentenciaRepository.create({
        procesoId: proceso.id,
        fallo: resultadoMotor.sentenciaFormal,
      });
      console.log("Sentencia object created (pre-save):", sentencia);
    } else {
      sentencia.fallo = resultadoMotor.sentenciaFormal;
    }

    await this.sentenciaRepository.save(sentencia);

    // 2.1 ACTUALIZAR ESTADO DEL PROCESO A "SENTENCIA"
    proceso.estado = EstadoProceso.SENTENCIA;
    await this.procesoRepository.save(proceso);

    // 3. PROCESAR RESULTADOS PARA RETORNO
    let montoSugerido = 0;
    const razonamientos = resultadoMotor.resultadosTecnicos.map((r: any) => {
      // Intentar extraer monto si existe en la acción
      if (r.accion && typeof r.accion === "object" && r.accion.montoCalculado) {
        montoSugerido = Number(r.accion.montoCalculado);
      }
      return r.fundamento;
    });

    return {
      procesoId: proceso.id,
      casoNumero: proceso.id_caso_dinamico || "SIN-NUMERO",
      hechosSimulacionId: hechosSimulacionSaved.id,
      simulacion: {
        montoSugerido:
          montoSugerido > 0 ? montoSugerido : simulateDto.montoSolicitado || 0,
        moneda: "DOP",
        razonamiento:
          razonamientos.length > 0
            ? razonamientos
            : ["Se aplicaron criterios generales de derecho de familia."],
        datosConsiderados: {
          necesidadesNNA: [],
          recursosDemandado: simulateDto.recursosDemandadoEstimados,
          montoSolicitadoUsuario: simulateDto.montoSolicitado,
          notasUsuario: simulateDto.notasAdicionales,
        },
      },
      sentenciaFormal: resultadoMotor.sentenciaFormal, // Enviamos el texto generado al frontend
      fechaSimulacion: hechosSimulacionSaved.fecha_simulacion,
    };
  }

  async getHistorialSimulaciones(
    procesoId: string
  ): Promise<HechosSimulacion[]> {
    // Verificar que el proceso existe
    await this.findOne(procesoId);

    // Obtener todas las simulaciones del proceso ordenadas por fecha (más recientes primero)
    return this.hechosSimulacionRepository.find({
      where: { proceso: { id: procesoId } },
      order: { fecha_simulacion: "DESC" },
    });
  }

  async getSimulacionById(simulacionId: string): Promise<HechosSimulacion> {
    const simulacion = await this.hechosSimulacionRepository.findOne({
      where: { id: simulacionId },
      relations: ["proceso", "proceso.nna"],
    });

    if (!simulacion) {
      throw new NotFoundException(
        `Simulación with ID ${simulacionId} not found`
      );
    }

    return simulacion;
  }
}
