import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { TipoDemanda } from './enums/proceso.enums';

@Entity()
export class Reglas {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  condition: string;

  @Column('text')
  action: string;

  @Column('text')
  legal_basis: string;

  @Column({ type: 'enum', enum: TipoDemanda })
  domain: TipoDemanda;
}
