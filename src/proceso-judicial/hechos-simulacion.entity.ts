import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { ProcesoJudicial } from './proceso-judicial.entity';

@Entity()
export class HechosSimulacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProcesoJudicial, (proceso) => proceso.hechosSimulaciones)
  proceso: ProcesoJudicial;

  @CreateDateColumn()
  fecha_simulacion: Date;

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
  @Column({ type: 'varchar', length: 50 })
  idoneidad_moral: string;

  @Column({ type: 'varchar', length: 50 })
  estado_emocional_de_los_padres: string;

  @Column({ type: 'boolean' })
  madre_demuestra_estabilidad_emocional: boolean;

  @Column({ type: 'boolean' })
  existen_antecedentes_de_violencia: boolean;

  @Column({ type: 'boolean' })
  evidencia_de_negligencia_severa: boolean;

  @Column({ type: 'boolean' })
  progenitor_conducta_agresiva_anterior: boolean;

  @Column({ type: 'boolean' })
  existen_reportes_psicosociales_negativos: boolean;

  // IV. ATRIBUTOS DE TIEMPO Y SALUD
  @Column({ type: 'varchar', length: 50 })
  disponibilidad_de_tiempo: string;

  @Column({ type: 'varchar', length: 50 })
  estado_de_salud_fisica_o_condiciones_medicas_del_progenitor: string;

  @Column({ type: 'boolean' })
  manejo_de_necesidades_especiales: boolean;

  // V. ATRIBUTOS FINANCIEROS Y CUMPLIMIENTO (PENSIONES)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  nivel_de_ingresos: number;

  @Column({ type: 'varchar', length: 50 })
  estabilidad_laboral_del_progenitor: string;

  @Column({ type: 'boolean' })
  padre_madre_tiene_ingresos_comprobados: boolean;

  @Column({ type: 'boolean' })
  progenitor_obligado_no_tiene_ingresos_formales: boolean;

  @Column({ type: 'boolean' })
  obligado_demuestra_cargas_familiares_adicionales: boolean;

  @Column({ type: 'boolean' })
  obligado_incumple_reiteradamente_pension: boolean;

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
}
