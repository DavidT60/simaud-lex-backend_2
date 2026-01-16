import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from "typeorm";
import { ParteProceso } from "../proceso-judicial/parte-proceso.entity";
import { User } from "../user/user.entity";

@Entity()
export class Person {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: false, nullable: true })
  cedula: string;

  @Column({ nullable: true })
  nombre_completo: string;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  recursos_economicos: number;

  @Column({ nullable: true })
  ocupacion: string;

  @Column("text", { nullable: true })
  entorno_hogar: string;

  @OneToMany(() => ParteProceso, (parteProceso) => parteProceso.persona)
  partesProceso: ParteProceso[];

  @OneToOne(() => User, (user) => user.person)
  user: User;
}
