import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { HechosSimulacion } from './hechos-simulacion.entity';

@Entity()
export class CasosSimilares {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => HechosSimulacion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'casoActualId' })
  casoActual: HechosSimulacion;

  @Column()
  casoActualId: string;

  @ManyToOne(() => HechosSimulacion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'casoSimilarId' })
  casoSimilar: HechosSimulacion;

  @Column()
  casoSimilarId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  scoreSimulitud: number; // 0-100

  @Column('json')
  camposCoincidentes: {
    campo: string;
    categoria: string;
    peso: number;
    coincide: boolean;
  }[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  puntuacionMadreSimilar: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  puntuacionPadreSimilar: number;

  @Column({ nullable: true })
  recomendacionSimilar: string;

  @CreateDateColumn()
  fechaComparacion: Date;
}
