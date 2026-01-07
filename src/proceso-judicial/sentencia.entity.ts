import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ProcesoJudicial } from "./proceso-judicial.entity";
import { User } from "../user/user.entity";

@Entity()
export class Sentencia {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("text")
  fallo: string;

  @Column({ type: "uuid", nullable: false })
  procesoId: string;

  @OneToOne(() => ProcesoJudicial, (proceso) => proceso.sentencia)
  @JoinColumn({ name: "procesoId" })
  proceso: ProcesoJudicial;

  // Creator tracking
  @Column({ type: 'varchar', length: 255, nullable: true })
  created_by_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  created_by_email: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'create_uid' })
  create_uid: User;
}
