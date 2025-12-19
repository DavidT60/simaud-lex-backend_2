import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Reglas } from './reglas.entity';
import { DTOFields } from './dto-fields.entity';

@Entity()
export class RelacionReglasDTO {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Reglas, { onDelete: 'CASCADE' })
  regla: Reglas;

  @ManyToOne(() => DTOFields, (dtoField) => dtoField.relaciones, { onDelete: 'CASCADE' })
  dtoField: DTOFields;

  @Column({ nullable: true })
  operator: string; // e.g., 'EQUALS', 'TRUE', 'GREATER_THAN'

  @Column({ nullable: true })
  value: string; // The target value to compare against
}
