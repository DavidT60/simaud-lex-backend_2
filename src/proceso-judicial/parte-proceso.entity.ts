import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Person } from '../person/person.entity';
import { ProcesoJudicial } from './proceso-judicial.entity';
import { RolParte } from './enums/proceso.enums';

@Entity()
export class ParteProceso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: RolParte })
  rol: RolParte;

  @ManyToOne(() => Person, (person) => person.partesProceso)
  persona: Person;

  @ManyToOne(() => ProcesoJudicial, (proceso) => proceso.partes)
  proceso: ProcesoJudicial;
}
