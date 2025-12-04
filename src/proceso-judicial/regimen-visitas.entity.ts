import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ProcesoJudicial } from './proceso-judicial.entity';

@Entity()
export class RegimenVisitas {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  dias_visita: string;

  @Column('time')
  hora_inicio: string;

  @Column('time')
  hora_fin: string;

  @Column('boolean')
  supervisado: boolean;

  @ManyToOne(() => ProcesoJudicial, (proceso) => proceso.regimenesVisita)
  proceso: ProcesoJudicial;
}
