import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ProcesoJudicial } from './proceso-judicial.entity';

@Entity()
export class Sentencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  fallo: string;

  @OneToOne(() => ProcesoJudicial, (proceso) => proceso.sentencia)
  @JoinColumn()
  proceso: ProcesoJudicial;
}
