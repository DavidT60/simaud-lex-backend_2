
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DTOFields } from './dto-fields.entity';
import { HechosSimulacion } from './hechos-simulacion.entity';
import { RelacionReglasDTO } from './relacion-reglas-dto.entity';
import { Reglas } from './reglas.entity';

@Injectable()
export class DtoFieldsService implements OnModuleInit {
  constructor(
    @InjectRepository(DTOFields)
    private readonly dtoFieldsRepository: Repository<DTOFields>,
    @InjectRepository(RelacionReglasDTO)
    private readonly relacionRepository: Repository<RelacionReglasDTO>,
     @InjectRepository(Reglas)
    private readonly reglasRepository: Repository<Reglas>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.populateFields();
  }

  async populateFields() {
    const metadata = this.dataSource.getMetadata(HechosSimulacion);
    const columns = metadata.columns; // Get full column metadata

    for (const col of columns) {
      const fieldName = col.propertyName;
      // Skip generic fields if needed, or include all
      if (fieldName === 'id' || fieldName === 'proceso' || fieldName === 'fecha_simulacion') {
         continue; 
      }

      // Determine type
      let fieldType = 'STRING';
      if (col.type === 'boolean' || col.type === 'bool') fieldType = 'BOOLEAN';
      else if (col.type === 'int' || col.type === 'decimal' || col.type === 'float' || col.type === 'double' || col.type === 'numeric') fieldType = 'NUMBER';
      else if (col.type === 'text') fieldType = 'TEXT';

      // Generate Label (remove underscores, capitalize)
      const label = fieldName
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const existing = await this.dtoFieldsRepository.findOne({ where: { fieldName } });
      if (existing) {
        // Update generic info if missing or changed
        if (existing.fieldType !== fieldType || existing.label !== label) {
             existing.fieldType = fieldType;
             existing.label = label;
             await this.dtoFieldsRepository.save(existing);
             console.log(`[DtoFieldsService] Updated field metadata: ${fieldName}`);
        }
      } else {
        await this.dtoFieldsRepository.save({ fieldName, fieldType, label });
        console.log(`[DtoFieldsService] Added field: ${fieldName} (${fieldType})`);
      }
    }
  }

  // --- Configuration Methods ---

  async getAllFields() {
    return this.dtoFieldsRepository.find({ order: { fieldName: 'ASC' } });
  }

  async getAllRules() {
    return this.reglasRepository.find({ order: { id: 'ASC' }});
  }

  async getRelationsForRule(reglaId: string) {
    return this.relacionRepository.find({
      where: { regla: { id: reglaId } },
      relations: ['dtoField', 'regla'],
    });
  }

  async createRelation(data: { reglaId: string; fieldId: string; operator: string; value: string }) {
    const regla = await this.reglasRepository.findOneBy({ id: data.reglaId });
    const field = await this.dtoFieldsRepository.findOneBy({ id: data.fieldId });

    if (!regla || !field) {
      throw new Error('Regla or Field not found');
    }

    const rel = this.relacionRepository.create({
      regla,
      dtoField: field,
      operator: data.operator,
      value: data.value,
    });
    return this.relacionRepository.save(rel);
  }

  async deleteRelation(id: string) {
    return this.relacionRepository.delete(id);
  }
}
