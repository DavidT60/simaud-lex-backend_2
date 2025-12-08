import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcesoJudicial } from './proceso-judicial.entity';
import { CreateProcesoJudicialDto } from './dto/create-proceso-judicial.dto';
import { UpdateProcesoJudicialDto } from './dto/update-proceso-judicial.dto';
import { Nna } from '../nna/nna.entity';
import { RolParte } from './enums/proceso.enums';

@Injectable()
export class ProcesoJudicialService {
  constructor(
    @InjectRepository(ProcesoJudicial)
    private readonly procesoRepository: Repository<ProcesoJudicial>,
    @InjectRepository(Nna)
    private readonly nnaRepository: Repository<Nna>,
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

  async generarSimulacionSentencia(id: string, simulateDto?: any): Promise<any> {
    const proceso = await this.findOne(id);
    
    // Usar monto solicitado por usuario o valor base
    let montoBase = simulateDto?.montoSolicitado || 5000;
    const necesidades = proceso.nna.necesidades_especiales || [];
    
    // Lógica básica: aumentar monto por cada necesidad especial
    if (necesidades.length > 0) {
      montoBase += 2000 * necesidades.length;
    }

    // Buscar demandado para evaluar recursos
    const demandado = proceso.partes.find(p => p.rol === RolParte.DEMANDADO);
    // Usar recursos estimados del formulario o del demandado existente
    let recursosDemandado = simulateDto?.recursosDemandadoEstimados || 0;
    
    if (!recursosDemandado && demandado && demandado.persona) {
      recursosDemandado = Number(demandado.persona.recursos_economicos);
    }
    
    // Si tiene buenos recursos, aumentar un poco la sugerencia
    if (recursosDemandado > 50000) {
      montoBase = montoBase * 1.2;
    }

    const razonamiento = [
      `Base inicial: ${simulateDto?.montoSolicitado || 5000}`,
      `Incremento por necesidades especiales (${necesidades.length}): ${necesidades.length * 2000}`,
      `Ajuste por recursos del demandado: ${recursosDemandado > 50000 ? '20% extra' : 'Sin ajuste'}`
    ];

    if (simulateDto?.notasAdicionales) {
      razonamiento.push(`Notas adicionales: ${simulateDto.notasAdicionales}`);
    }

    return {
      procesoId: id,
      casoNumero: proceso.id_caso_dinamico,
      simulacion: {
        montoSugerido: Math.round(montoBase),
        moneda: 'DOP',
        razonamiento,
        datosConsiderados: {
          necesidadesNNA: necesidades,
          recursosDemandado,
          montoSolicitadoUsuario: simulateDto?.montoSolicitado,
          notasUsuario: simulateDto?.notasAdicionales
        }
      },
      fechaSimulacion: new Date().toISOString()
    };
  }
}
