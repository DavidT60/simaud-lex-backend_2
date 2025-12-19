import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RelacionReglasDTO } from './relacion-reglas-dto.entity'

@Entity()
export class DTOFields {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  fieldName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  label: string;

  @Column({ nullable: true })
  fieldType: string; // 'BOOLEAN', 'NUMBER', 'STRING', etc.

  @OneToMany(() => RelacionReglasDTO, (relacion) => relacion.dtoField)
  relaciones: RelacionReglasDTO[];
}
