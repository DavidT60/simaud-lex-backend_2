import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ProcesoJudicial } from './proceso-judicial.entity';
import { FrecuenciaPago, ModalidadPago } from './enums/proceso.enums';

@Entity()
export class ObligacionAlimentaria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  monto_fijado: number;

  @Column({ type: 'enum', enum: FrecuenciaPago })
  frecuencia_pago: FrecuenciaPago;

  @Column({ type: 'enum', enum: ModalidadPago })
  modalidad_pago: ModalidadPago;

  @ManyToOne(() => ProcesoJudicial, (proceso) => proceso.obligaciones)
  proceso: ProcesoJudicial;
}
