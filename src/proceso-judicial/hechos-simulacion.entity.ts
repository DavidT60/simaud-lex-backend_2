import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn,  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ProcesoJudicial } from './proceso-judicial.entity';
import { CasosSimilares } from './casos-similares.entity';
import { User } from '../user/user.entity';

@Entity()
export class HechosSimulacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProcesoJudicial, (proceso) => proceso.hechosSimulaciones)
  proceso: ProcesoJudicial;

  @CreateDateColumn()
  fecha_simulacion: Date;

  // RESULTADOS DEL MOTOR DE INFERENCIA
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  puntuacion_madre?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  puntuacion_padre?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  recomendacion_custodia?: string;

  // ATRIBUTOS ORIGINALES
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montoSolicitado?: number;

  @Column({ type: 'text', nullable: true })
  notasAdicionales?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  recursosDemandadoEstimados?: number;

  // I. ATRIBUTOS DEL MENOR
  @Column({ type: 'int' })
  edad_del_menor: number;

  @Column({ type: 'varchar', length: 50 })
  preferencia_del_menor: string;

  @Column({ type: 'boolean' })
  expresa_preferencia_valida: boolean;

  @Column({ type: 'boolean' })
  tiene_madurez_suficiente: boolean;

  @Column({ type: 'boolean' })
  menor_tiene_necesidades_especiales: boolean;

  // II. ATRIBUTOS DE GUARDA / AMBIENTE
  @Column({ type: 'varchar', length: 50 })
  custodia_previa: string;

  @Column({ type: 'varchar', length: 50 })
  condiciones_de_la_vivienda: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  distancia_entre_domicilios: number;

  @Column({ type: 'varchar', length: 50 })
  presencia_escolar: string;

  @Column({ type: 'boolean' })
  ambos_padres_tienen_condiciones_adecuadas: boolean;

  // III. ATRIBUTOS DE PROGENITORES (GENERAL)
  // CAMPOS ANTIGUOS (Nullable para retrocompatibilidad)
  @Column({ type: 'varchar', length: 50, nullable: true })
  idoneidad_moral?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  estado_emocional_de_los_padres?: string;

  @Column({ type: 'boolean', nullable: true })
  existen_antecedentes_de_violencia?: boolean;

  @Column({ type: 'boolean', nullable: true })
  evidencia_de_negligencia_severa?: boolean;

  @Column({ type: 'boolean', nullable: true })
  progenitor_conducta_agresiva_anterior?: boolean;

  @Column({ type: 'boolean', nullable: true })
  existen_reportes_psicosociales_negativos?: boolean;

  // CAMPOS NUEVOS SEPARADOS POR PROGENITOR
  // Madre
  @Column({ type: 'varchar', length: 255, nullable: true })
  nombre_madre: string;

  @Column({ type: 'varchar', length: 50 })
  idoneidad_moral_madre: string;

  @Column({ type: 'varchar', length: 50 })
  estado_emocional_madre: string;

  @Column({ type: 'boolean' })
  madre_demuestra_estabilidad_emocional: boolean;

  @Column({ type: 'boolean' })
  madre_tiene_antecedentes_de_violencia: boolean;

  @Column({ type: 'boolean' })
  madre_evidencia_negligencia_severa: boolean;

  @Column({ type: 'boolean' })
  madre_conducta_agresiva_anterior: boolean;

  @Column({ type: 'boolean' })
  madre_reportes_psicosociales_negativos: boolean;

  // Padre
  @Column({ type: 'varchar', length: 255, nullable: true })
  nombre_padre: string;

  @Column({ type: 'varchar', length: 50 })
  idoneidad_moral_padre: string;

  @Column({ type: 'varchar', length: 50 })
  estado_emocional_padre: string;

  @Column({ type: 'boolean' })
  padre_demuestra_estabilidad_emocional: boolean;

  @Column({ type: 'boolean' })
  padre_tiene_antecedentes_de_violencia: boolean;

  @Column({ type: 'boolean' })
  padre_evidencia_negligencia_severa: boolean;

  @Column({ type: 'boolean' })
  padre_conducta_agresiva_anterior: boolean;

  @Column({ type: 'boolean' })
  padre_reportes_psicosociales_negativos: boolean;

  // IV. ATRIBUTOS DE TIEMPO Y SALUD
  // CAMPOS ANTIGUOS (Nullable para retrocompatibilidad)
  @Column({ type: 'varchar', length: 50, nullable: true })
  disponibilidad_de_tiempo?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  estado_de_salud_fisica_o_condiciones_medicas_del_progenitor?: string;

  @Column({ type: 'boolean', nullable: true })
  manejo_de_necesidades_especiales?: boolean;

  // CAMPOS NUEVOS SEPARADOS POR PROGENITOR
  // Madre
  @Column({ type: 'varchar', length: 50 })
  disponibilidad_de_tiempo_madre: string;

  @Column({ type: 'varchar', length: 50 })
  estado_de_salud_madre: string;

  @Column({ type: 'boolean' })
  madre_maneja_necesidades_especiales: boolean;

  // Padre
  @Column({ type: 'varchar', length: 50 })
  disponibilidad_de_tiempo_padre: string;

  @Column({ type: 'varchar', length: 50 })
  estado_de_salud_padre: string;

  @Column({ type: 'boolean' })
  padre_maneja_necesidades_especiales: boolean;

  // V. ATRIBUTOS FINANCIEROS Y CUMPLIMIENTO (PENSIONES)
  // CAMPOS ANTIGUOS (Nullable para retrocompatibilidad)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  nivel_de_ingresos?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  estabilidad_laboral_del_progenitor?: string;

  @Column({ type: 'boolean', nullable: true })
  padre_madre_tiene_ingresos_comprobados?: boolean;

  @Column({ type: 'boolean', nullable: true })
  progenitor_obligado_no_tiene_ingresos_formales?: boolean;

  @Column({ type: 'boolean', nullable: true })
  obligado_demuestra_cargas_familiares_adicionales?: boolean;

  @Column({ type: 'boolean', nullable: true })
  obligado_incumple_reiteradamente_pension?: boolean;

  // CAMPOS NUEVOS SEPARADOS POR PROGENITOR
  // Madre
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  nivel_de_ingresos_madre: number;

  @Column({ type: 'varchar', length: 50 })
  estabilidad_laboral_madre: string;

  @Column({ type: 'boolean' })
  madre_tiene_ingresos_comprobados: boolean;

  @Column({ type: 'boolean' })
  madre_sin_ingresos_formales: boolean;

  @Column({ type: 'boolean' })
  madre_cargas_familiares_adicionales: boolean;

  @Column({ type: 'boolean' })
  madre_incumple_pension: boolean;

  // Padre
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  nivel_de_ingresos_padre: number;

  @Column({ type: 'varchar', length: 50 })
  estabilidad_laboral_padre: string;

  @Column({ type: 'boolean' })
  padre_tiene_ingresos_comprobados: boolean;

  @Column({ type: 'boolean' })
  padre_sin_ingresos_formales: boolean;

  @Column({ type: 'boolean' })
  padre_cargas_familiares_adicionales: boolean;

  @Column({ type: 'boolean' })
  padre_incumple_pension: boolean;

  @Column({ type: 'varchar', length: 50 })
  cumplimiento_de_las_obligaciones_previas: string;

  // VI. ATRIBUTOS PROCESALES
  @Column({ type: 'boolean' })
  documentos_presentados_validos: boolean;

  @Column({ type: 'boolean' })
  notificacion_correcta_verdadera: boolean;

  @Column({ type: 'boolean' })
  parte_no_comparece_sin_justificacion: boolean;

  @Column({ type: 'boolean' })
  testigo_relevante_valido: boolean;

  @Column({ type: 'boolean' })
  prueba_psicosocial_disponible: boolean;

  @Column({ type: 'boolean' })
  hay_conciliacion_entre_las_partes: boolean;

  @Column({ type: 'boolean' })
  evidencia_contradice_testimonio: boolean;

  @Column({ type: 'boolean' })
  pruebas_son_insuficientes: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'create_uid' })
  create_uid: User;

  @OneToMany(() => CasosSimilares, (similar) => similar.casoActual)
  casosSimilares: CasosSimilares[];
}
