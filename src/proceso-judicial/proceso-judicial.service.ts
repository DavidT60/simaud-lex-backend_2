import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcesoJudicial } from './proceso-judicial.entity';
import { CreateProcesoJudicialDto } from './dto/create-proceso-judicial.dto';
import { UpdateProcesoJudicialDto } from './dto/update-proceso-judicial.dto';
import { SimulateSentenciaDto } from './dto/simulate-sentencia.dto';
import { HechosSimulacion } from './hechos-simulacion.entity';
import { Nna } from '../nna/nna.entity';
import { RolParte } from './enums/proceso.enums';

@Injectable()
export class ProcesoJudicialService {
  constructor(
    @InjectRepository(ProcesoJudicial)
    private readonly procesoRepository: Repository<ProcesoJudicial>,
    @InjectRepository(Nna)
    private readonly nnaRepository: Repository<Nna>,
    @InjectRepository(HechosSimulacion)
    private readonly hechosSimulacionRepository: Repository<HechosSimulacion>,
  ) {}

  async create(createDto: CreateProcesoJudicialDto): Promise<ProcesoJudicial> {
    const nna = await this.nnaRepository.findOne({ where: { id: createDto.nnaId } });
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
    return this.procesoRepository.find({ relations: ['nna', 'partes', 'partes.persona'] });
  }

  async findOne(id: string): Promise<ProcesoJudicial> {
    const proceso = await this.procesoRepository.findOne({
      where: { id },
      relations: ['nna', 'partes', 'partes.persona', 'obligaciones', 'regimenesVisita', 'sentencia']
    });
    if (!proceso) {
      throw new NotFoundException(`ProcesoJudicial with ID ${id} not found`);
    }
    return proceso;
  }

  async update(id: string, updateDto: UpdateProcesoJudicialDto): Promise<ProcesoJudicial> {
    const proceso = await this.findOne(id);
    this.procesoRepository.merge(proceso, updateDto);
    return this.procesoRepository.save(proceso);
  }

  async remove(id: string): Promise<void> {
    const proceso = await this.findOne(id);
    await this.procesoRepository.remove(proceso);
  }

  async generarSimulacionSentencia(id: string, simulateDto: SimulateSentenciaDto): Promise<any> {
    const proceso = await this.findOne(id);
    
    // Guardar los hechos de la simulación en la base de datos
    const hechosSimulacion = this.hechosSimulacionRepository.create({
      proceso,
      ...simulateDto
    });
    console.log(hechosSimulacion);
   
   
    let hechosSimulacionSaved = await this.hechosSimulacionRepository.save(hechosSimulacion);
    console.log(hechosSimulacionSaved);
    // 1 MOTOR DE RAZONAMIENTO //
    // 2 ENVIAR DATOS AL LLM DEL MOTOR DE RAZONAMIENTO //
    // 3 GUARDAR DATOS DEL MOTOR DE RAZONAMIENTO EN LA BASE DE DATOS //
    // 4 ACTUALIZAR EL ESTADO DE CASO EN LA BASE DE DATOS //
    // 4.1 ACTUALIZAR EL ESTADO DE CASO EN LA BASE DE DATOS //
    // 4.2 RETORNAR EL PROCESO JUDICIAL ACTUALIZADO //

    return {
      procesoId: 20,
      casoNumero: 'RAMDOM-ID-133',
      hechosSimulacionId: 'RAMDOM-ID-133',
      simulacion: {
        montoSugerido: 10000,
        moneda: 'DOP',
        razonamiento: [],
        datosConsiderados: {
          necesidadesNNA: [],
          recursosDemandado: 0,
          montoSolicitadoUsuario: 5000  ,
          notasUsuario: 'Ninguna'
        }
      },
      fechaSimulacion: new Date().toISOString()
    };
  }

  async getHistorialSimulaciones(procesoId: string): Promise<HechosSimulacion[]> {
    // Verificar que el proceso existe
    await this.findOne(procesoId);
    
    // Obtener todas las simulaciones del proceso ordenadas por fecha (más recientes primero)
    return this.hechosSimulacionRepository.find({
      where: { proceso: { id: procesoId } },
      order: { fecha_simulacion: 'DESC' }
    });
  }

  async getSimulacionById(simulacionId: string): Promise<HechosSimulacion> {
    const simulacion = await this.hechosSimulacionRepository.findOne({
      where: { id: simulacionId },
      relations: ['proceso', 'proceso.nna']
    });
    
    if (!simulacion) {
      throw new NotFoundException(`Simulación with ID ${simulacionId} not found`);
    }
    
    return simulacion;
  }
}
