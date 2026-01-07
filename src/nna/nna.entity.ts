import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ProcesoJudicial } from '../proceso-judicial/proceso-judicial.entity';
import { User } from '../user/user.entity';

@Entity()
export class Nna {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre_completo: string;

  @Column('date')
  fecha_nacimiento: Date;

  @Column('text', { nullable: true })
  opinion_nna: string;

  @Column('jsonb', { nullable: true })
  necesidades_especiales: string[];

  @OneToMany(() => ProcesoJudicial, (proceso) => proceso.nna)
  procesos: ProcesoJudicial[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'create_uid' })
  create_uid: User;
}
