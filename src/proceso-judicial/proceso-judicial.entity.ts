import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  BeforeInsert,
  JoinColumn,
} from "typeorm";
import { Nna } from "../nna/nna.entity";
import { User } from "../user/user.entity";
import { EstadoProceso, TipoDemanda } from "./enums/proceso.enums";
import { ParteProceso } from "./parte-proceso.entity";
import { Sentencia } from "./sentencia.entity";
import { ObligacionAlimentaria } from "./obligacion-alimentaria.entity";
import { RegimenVisitas } from "./regimen-visitas.entity";
import { HechosSimulacion } from "./hechos-simulacion.entity";

@Entity()
export class ProcesoJudicial {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 50, unique: true, nullable: true })
  id_caso_dinamico: string;

  @Column({ type: "int", nullable: true })
  calificacion: number;

  @Column({ type: "text", nullable: true })
  detallesCalificacion: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "calificado_por_uid" })
  calificadoPor: User;

  @Column({ type: "boolean", nullable: true, default: false })
  is_calificacion: Boolean;

  @Column("date")
  fecha_inicio: Date;

  @Column({ type: "enum", enum: EstadoProceso })
  estado: EstadoProceso;

  @Column({ type: "enum", enum: TipoDemanda })
  tipo_demanda: TipoDemanda;

  @ManyToOne(() => Nna, (nna) => nna.procesos)
  nna: Nna;

  @OneToMany(() => ParteProceso, (parte) => parte.proceso)
  partes: ParteProceso[];

  @OneToOne(() => Sentencia, (sentencia) => sentencia.proceso)
  sentencia: Sentencia;

  @OneToMany(() => ObligacionAlimentaria, (obligacion) => obligacion.proceso)
  obligaciones: ObligacionAlimentaria[];

  @OneToMany(() => RegimenVisitas, (regimen) => regimen.proceso)
  regimenesVisita: RegimenVisitas[];

  @OneToMany(() => HechosSimulacion, (hechos) => hechos.proceso)
  hechosSimulaciones: HechosSimulacion[];

  @BeforeInsert()
  generateDynamicId() {
    if (!this.id_caso_dinamico) {
      const year = new Date().getFullYear();
      // Use timestamp for uniqueness (last 4 digits of current timestamp)
      // This ensures uniqueness while maintaining readability
      const sequential = Date.now().toString().slice(-4);
      this.id_caso_dinamico = `${year}-${sequential}-1`;
    }
  }

  @ManyToOne(() => User, { nullable: true }) // Traceability
  @JoinColumn({ name: "create_uid" })
  create_uid: User;
}
