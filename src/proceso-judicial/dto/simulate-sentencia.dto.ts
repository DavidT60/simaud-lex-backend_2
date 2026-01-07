import { ApiProperty } from '@nestjs/swagger';

import { 
  IsNumber, 
  IsString, 
  IsBoolean, 
  IsOptional, 
  IsIn, 
  Min,
  IsEnum // Se usa para validar enums con la opción `enum` de ApiProperty
} from 'class-validator';

// =========================================================
// Definiciones de tipos para los Enums (opcional pero recomendado para consistencia)
// =========================================================

export type PreferenciaMenor = 'MADRE' | 'PADRE' | 'AMBOS' | 'NINGUNA';
export type CustodiaPrevia = 'MADRE' | 'PADRE' | 'COMPARTIDA' | 'NINGUNA';
export type CondicionesVivienda = 'ADECUADAS' | 'INADECUADAS';
export type PresenciaEscolar = 'REGULAR' | 'IRREGULAR';
export type IdoneidadMoral = 'BUENA' | 'MEDIA' | 'MALA';
export type EstadoEmocionalPadres = 'ESTABLE' | 'INESTABLE' | 'BAJO_TRATAMIENTO';
export type DisponibilidadTiempo = 'ALTA' | 'MEDIA' | 'BAJA';
export type EstadoSalud = 'SANO' | 'CON_CONDICION';
export type EstabilidadLaboral = 'ESTABLE' | 'INDEPENDIENTE' | 'DESEMPLEADO';
export type CumplimientoObligaciones = 'BUENO' | 'REGULAR' | 'MALO';

// =========================================================
// DTO Principal
// =========================================================

export class SimulateSentenciaDto {
  // ATRIBUTOS ORIGINALES
  @ApiProperty({ 
    example: 15000, 
    description: 'Monto que el usuario desea simular (opcional)', 
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  montoSolicitado?: number;

  @ApiProperty({ 
    example: 'El NNA requiere terapia especializada adicional', 
    description: 'Notas sobre necesidades especiales adicionales', 
    required: false 
  })
  @IsOptional()
  @IsString()
  notasAdicionales?: string;

  @ApiProperty({ 
    example: 80000, 
    description: 'Estimación actualizada de recursos del demandado', 
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  recursosDemandadoEstimados?: number;


  // =========================================================
  // I. ATRIBUTOS DEL MENOR
  // =========================================================
  @ApiProperty({ 
    example: 8, 
    description: 'Edad del menor de edad',
    minimum: 0 
  })
  @IsNumber()
  @Min(0)
  edad_del_menor: number;

  @ApiProperty({ 
    example: 'MADRE', 
    description: 'Preferencia manifestada por el menor',
    enum: ['MADRE', 'PADRE', 'AMBOS', 'NINGUNA']
  })
  @IsIn(['MADRE', 'PADRE', 'AMBOS', 'NINGUNA'])
  preferencia_del_menor: PreferenciaMenor; 
  
  // Condiciones de Regla 4:
  @ApiProperty({ example: true, description: 'Si el menor expresa una preferencia válida.' })
  @IsBoolean()
  expresa_preferencia_valida: boolean; 

  @ApiProperty({ example: true, description: 'Si el menor tiene madurez suficiente para que su preferencia sea considerada.' })
  @IsBoolean()
  tiene_madurez_suficiente: boolean; 
  
  // Condición de Regla 8:
  @ApiProperty({ example: false, description: 'Indica si el menor tiene necesidades especiales (para cálculo de pensión).' })
  @IsBoolean()
  menor_tiene_necesidades_especiales: boolean; 
  
  // =========================================================
  // II. ATRIBUTOS DE GUARDA / AMBIENTE
  // =========================================================
  @ApiProperty({ 
    example: 'COMPARTIDA', 
    description: 'Custodia previa al proceso legal',
    enum: ['MADRE', 'PADRE', 'COMPARTIDA', 'NINGUNA']
  })
  @IsIn(['MADRE', 'PADRE', 'COMPARTIDA', 'NINGUNA'])
  custodia_previa: CustodiaPrevia;

  @ApiProperty({ 
    example: 'ADECUADAS', 
    description: 'Condiciones generales de la vivienda del progenitor a cargo',
    enum: ['ADECUADAS', 'INADECUADAS']
  })
  @IsIn(['ADECUADAS', 'INADECUADAS'])
  condiciones_de_la_vivienda: CondicionesVivienda; 

  @ApiProperty({ 
    example: 5, 
    description: 'Distancia en Kilómetros entre los domicilios de los progenitores (Regla 13).',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  distancia_entre_domicilios: number; 

  @ApiProperty({ 
    example: 'REGULAR', 
    description: 'Asistencia y participación escolar del menor',
    enum: ['REGULAR', 'IRREGULAR']
  })
  @IsIn(['REGULAR', 'IRREGULAR'])
  presencia_escolar: PresenciaEscolar;

  // Condición de Regla 3:
  @ApiProperty({ example: true, description: 'Si ambos padres cumplen con las condiciones mínimas adecuadas de ambiente/vivienda.' })
  @IsBoolean()
  ambos_padres_tienen_condiciones_adecuadas: boolean;

  // =========================================================
  // III. ATRIBUTOS DE PROGENITORES (GENERAL)
  // =========================================================
  // CAMPOS ANTIGUOS (Opcionales para retrocompatibilidad)
  @ApiProperty({ 
    example: 'BUENA', 
    description: '(DEPRECATED) Evaluación de la idoneidad moral general de los progenitores. Usar idoneidad_moral_madre/padre',
    enum: ['BUENA', 'MEDIA', 'MALA'],
    required: false
  })
  @IsOptional()
  @IsIn(['BUENA', 'MEDIA', 'MALA'])
  idoneidad_moral?: IdoneidadMoral; 

  @ApiProperty({ 
    example: 'ESTABLE', 
    description: '(DEPRECATED) Estado emocional general de los padres. Usar estado_emocional_madre/padre',
    enum: ['ESTABLE', 'INESTABLE', 'BAJO_TRATAMIENTO'],
    required: false
  })
  @IsOptional()
  @IsIn(['ESTABLE', 'INESTABLE', 'BAJO_TRATAMIENTO'])
  estado_emocional_de_los_padres?: EstadoEmocionalPadres; 
  
  // CAMPOS NUEVOS SEPARADOS POR PROGENITOR
  // Madre
  @ApiProperty({ 
    example: 'María González', 
    description: 'Nombre completo de la madre',
    required: false
  })
  @IsOptional()
  @IsString()
  nombre_madre?: string;

  @ApiProperty({ 
    example: 'BUENA', 
    description: 'Evaluación de la idoneidad moral de la madre',
    enum: ['BUENA', 'MEDIA', 'MALA']
  })
  @IsIn(['BUENA', 'MEDIA', 'MALA'])
  idoneidad_moral_madre: IdoneidadMoral;

  @ApiProperty({ 
    example: 'ESTABLE', 
    description: 'Estado emocional de la madre',
    enum: ['ESTABLE', 'INESTABLE', 'BAJO_TRATAMIENTO']
  })
  @IsIn(['ESTABLE', 'INESTABLE', 'BAJO_TRATAMIENTO'])
  estado_emocional_madre: EstadoEmocionalPadres;

  @ApiProperty({ example: true, description: 'Si la madre demuestra estabilidad emocional para el cuidado.' })
  @IsBoolean()
  madre_demuestra_estabilidad_emocional: boolean;

  @ApiProperty({ example: false, description: 'Antecedentes de violencia de la madre.' })
  @IsBoolean()
  madre_tiene_antecedentes_de_violencia: boolean;

  @ApiProperty({ example: false, description: 'Evidencia de negligencia severa de la madre.' })
  @IsBoolean()
  madre_evidencia_negligencia_severa: boolean;

  @ApiProperty({ example: false, description: 'Si la madre tiene un historial de conducta agresiva.' })
  @IsBoolean()
  madre_conducta_agresiva_anterior: boolean;

  @ApiProperty({ example: false, description: 'Reportes psicosociales desfavorables de la madre.' })
  @IsBoolean()
  madre_reportes_psicosociales_negativos: boolean;

  // Padre
  @ApiProperty({ 
    example: 'Juan Pérez', 
    description: 'Nombre completo del padre',
    required: false
  })
  @IsOptional()
  @IsString()
  nombre_padre?: string;

  @ApiProperty({ 
    example: 'BUENA', 
    description: 'Evaluación de la idoneidad moral del padre',
    enum: ['BUENA', 'MEDIA', 'MALA']
  })
  @IsIn(['BUENA', 'MEDIA', 'MALA'])
  idoneidad_moral_padre: IdoneidadMoral;

  @ApiProperty({ 
    example: 'ESTABLE', 
    description: 'Estado emocional del padre',
    enum: ['ESTABLE', 'INESTABLE', 'BAJO_TRATAMIENTO']
  })
  @IsIn(['ESTABLE', 'INESTABLE', 'BAJO_TRATAMIENTO'])
  estado_emocional_padre: EstadoEmocionalPadres;

  @ApiProperty({ example: true, description: 'Si el padre demuestra estabilidad emocional para el cuidado.' })
  @IsBoolean()
  padre_demuestra_estabilidad_emocional: boolean;

  @ApiProperty({ example: false, description: 'Antecedentes de violencia del padre.' })
  @IsBoolean()
  padre_tiene_antecedentes_de_violencia: boolean;

  @ApiProperty({ example: false, description: 'Evidencia de negligencia severa del padre.' })
  @IsBoolean()
  padre_evidencia_negligencia_severa: boolean;

  @ApiProperty({ example: false, description: 'Si el padre tiene un historial de conducta agresiva.' })
  @IsBoolean()
  padre_conducta_agresiva_anterior: boolean;

  @ApiProperty({ example: false, description: 'Reportes psicosociales desfavorables del padre.' })
  @IsBoolean()
  padre_reportes_psicosociales_negativos: boolean;

  // CAMPOS ANTIGUOS (Opcionales para retrocompatibilidad)
  @ApiProperty({ example: false, description: '(DEPRECATED) Usar madre_tiene_antecedentes_de_violencia/padre_tiene_antecedentes_de_violencia', required: false })
  @IsOptional()
  @IsBoolean()
  existen_antecedentes_de_violencia?: boolean; 

  @ApiProperty({ example: false, description: '(DEPRECATED) Usar madre_evidencia_negligencia_severa/padre_evidencia_negligencia_severa', required: false })
  @IsOptional()
  @IsBoolean()
  evidencia_de_negligencia_severa?: boolean; 

  @ApiProperty({ example: false, description: '(DEPRECATED) Usar madre_conducta_agresiva_anterior/padre_conducta_agresiva_anterior', required: false })
  @IsOptional()
  @IsBoolean()
  progenitor_conducta_agresiva_anterior?: boolean;

  @ApiProperty({ example: false, description: '(DEPRECATED) Usar madre_reportes_psicosociales_negativos/padre_reportes_psicosociales_negativos', required: false })
  @IsOptional()
  @IsBoolean()
  existen_reportes_psicosociales_negativos?: boolean;
  
  // =========================================================
  // IV. ATRIBUTOS DE TIEMPO Y SALUD
  // =========================================================
  // CAMPOS ANTIGUOS (Opcionales para retrocompatibilidad)
  @ApiProperty({ 
    example: 'ALTA', 
    description: '(DEPRECATED) Usar disponibilidad_de_tiempo_madre/padre',
    enum: ['ALTA', 'MEDIA', 'BAJA'],
    required: false
  })
  @IsOptional()
  @IsIn(['ALTA', 'MEDIA', 'BAJA'])
  disponibilidad_de_tiempo?: DisponibilidadTiempo; 

  @ApiProperty({ 
    example: 'SANO', 
    description: '(DEPRECATED) Usar estado_de_salud_madre/padre',
    enum: ['SANO', 'CON_CONDICION'],
    required: false
  })
  @IsOptional()
  @IsIn(['SANO', 'CON_CONDICION'])
  estado_de_salud_fisica_o_condiciones_medicas_del_progenitor?: EstadoSalud; 

  @ApiProperty({ example: true, description: '(DEPRECATED) Usar madre_maneja_necesidades_especiales/padre_maneja_necesidades_especiales', required: false })
  @IsOptional()
  @IsBoolean()
  manejo_de_necesidades_especiales?: boolean; 

  // CAMPOS NUEVOS SEPARADOS POR PROGENITOR
  // Madre
  @ApiProperty({ 
    example: 'ALTA', 
    description: 'Disponibilidad de tiempo de la madre para el cuidado del menor',
    enum: ['ALTA', 'MEDIA', 'BAJA']
  })
  @IsIn(['ALTA', 'MEDIA', 'BAJA'])
  disponibilidad_de_tiempo_madre: DisponibilidadTiempo;

  @ApiProperty({ 
    example: 'SANO', 
    description: 'Estado de salud física de la madre',
    enum: ['SANO', 'CON_CONDICION']
  })
  @IsIn(['SANO', 'CON_CONDICION'])
  estado_de_salud_madre: EstadoSalud;

  @ApiProperty({ example: true, description: 'Si la madre demuestra buen manejo de las necesidades especiales del menor.' })
  @IsBoolean()
  madre_maneja_necesidades_especiales: boolean;

  // Padre
  @ApiProperty({ 
    example: 'ALTA', 
    description: 'Disponibilidad de tiempo del padre para el cuidado del menor',
    enum: ['ALTA', 'MEDIA', 'BAJA']
  })
  @IsIn(['ALTA', 'MEDIA', 'BAJA'])
  disponibilidad_de_tiempo_padre: DisponibilidadTiempo;

  @ApiProperty({ 
    example: 'SANO', 
    description: 'Estado de salud física del padre',
    enum: ['SANO', 'CON_CONDICION']
  })
  @IsIn(['SANO', 'CON_CONDICION'])
  estado_de_salud_padre: EstadoSalud;

  @ApiProperty({ example: true, description: 'Si el padre demuestra buen manejo de las necesidades especiales del menor.' })
  @IsBoolean()
  padre_maneja_necesidades_especiales: boolean;
  
  // =========================================================
  // V. ATRIBUTOS FINANCIEROS Y CUMPLIMIENTO (PENSIONES)
  // =========================================================
  // CAMPOS ANTIGUOS (Opcionales para retrocompatibilidad)
  @ApiProperty({ 
    example: 50000, 
    description: '(DEPRECATED) Usar nivel_de_ingresos_madre/padre',
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  nivel_de_ingresos?: number; 

  @ApiProperty({ 
    example: 'ESTABLE', 
    description: '(DEPRECATED) Usar estabilidad_laboral_madre/padre',
    enum: ['ESTABLE', 'INDEPENDIENTE', 'DESEMPLEADO'],
    required: false
  })
  @IsOptional()
  @IsIn(['ESTABLE', 'INDEPENDIENTE', 'DESEMPLEADO'])
  estabilidad_laboral_del_progenitor?: EstabilidadLaboral;

  @ApiProperty({ example: true, description: '(DEPRECATED) Usar madre_tiene_ingresos_comprobados/padre_tiene_ingresos_comprobados', required: false })
  @IsOptional()
  @IsBoolean()
  padre_madre_tiene_ingresos_comprobados?: boolean; 

  @ApiProperty({ example: false, description: '(DEPRECATED) Usar madre_sin_ingresos_formales/padre_sin_ingresos_formales', required: false })
  @IsOptional()
  @IsBoolean()
  progenitor_obligado_no_tiene_ingresos_formales?: boolean; 

  @ApiProperty({ example: true, description: '(DEPRECATED) Usar madre_cargas_familiares_adicionales/padre_cargas_familiares_adicionales', required: false })
  @IsOptional()
  @IsBoolean()
  obligado_demuestra_cargas_familiares_adicionales?: boolean;

  @ApiProperty({ example: false, description: '(DEPRECATED) Usar madre_incumple_pension/padre_incumple_pension', required: false })
  @IsOptional()
  @IsBoolean()
  obligado_incumple_reiteradamente_pension?: boolean;

  // CAMPOS NUEVOS SEPARADOS POR PROGENITOR
  // Madre
  @ApiProperty({ 
    example: 50000, 
    description: 'Nivel de ingresos mensuales netos de la madre',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  nivel_de_ingresos_madre: number;

  @ApiProperty({ 
    example: 'ESTABLE', 
    description: 'Estabilidad de la situación laboral de la madre',
    enum: ['ESTABLE', 'INDEPENDIENTE', 'DESEMPLEADO']
  })
  @IsIn(['ESTABLE', 'INDEPENDIENTE', 'DESEMPLEADO'])
  estabilidad_laboral_madre: EstabilidadLaboral;

  @ApiProperty({ example: true, description: 'Si la madre tiene ingresos comprobados formalmente.' })
  @IsBoolean()
  madre_tiene_ingresos_comprobados: boolean;

  @ApiProperty({ example: false, description: 'Si la madre no tiene ingresos formales.' })
  @IsBoolean()
  madre_sin_ingresos_formales: boolean;

  @ApiProperty({ example: true, description: 'Si la madre demuestra cargas familiares (otros dependientes) adicionales.' })
  @IsBoolean()
  madre_cargas_familiares_adicionales: boolean;

  @ApiProperty({ example: false, description: 'Si la madre tiene historial de incumplimiento de pensión alimenticia.' })
  @IsBoolean()
  madre_incumple_pension: boolean;

  // Padre
  @ApiProperty({ 
    example: 50000, 
    description: 'Nivel de ingresos mensuales netos del padre',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  nivel_de_ingresos_padre: number;

  @ApiProperty({ 
    example: 'ESTABLE', 
    description: 'Estabilidad de la situación laboral del padre',
    enum: ['ESTABLE', 'INDEPENDIENTE', 'DESEMPLEADO']
  })
  @IsIn(['ESTABLE', 'INDEPENDIENTE', 'DESEMPLEADO'])
  estabilidad_laboral_padre: EstabilidadLaboral;

  @ApiProperty({ example: true, description: 'Si el padre tiene ingresos comprobados formalmente.' })
  @IsBoolean()
  padre_tiene_ingresos_comprobados: boolean;

  @ApiProperty({ example: false, description: 'Si el padre no tiene ingresos formales.' })
  @IsBoolean()
  padre_sin_ingresos_formales: boolean;

  @ApiProperty({ example: true, description: 'Si el padre demuestra cargas familiares (otros dependientes) adicionales.' })
  @IsBoolean()
  padre_cargas_familiares_adicionales: boolean;

  @ApiProperty({ example: false, description: 'Si el padre tiene historial de incumplimiento de pensión alimenticia.' })
  @IsBoolean()
  padre_incumple_pension: boolean;

  @ApiProperty({ 
    example: 'BUENO', 
    description: 'Nivel de cumplimiento general de obligaciones previas (régimen de visitas, acuerdos, etc.)',
    enum: ['BUENO', 'REGULAR', 'MALO']
  })
  @IsIn(['BUENO', 'REGULAR', 'MALO'])
  cumplimiento_de_las_obligaciones_previas: CumplimientoObligaciones;

  // =========================================================
  // VI. ATRIBUTOS PROCESALES (Para Reglas 15, 16, 17, 19, 22)
  // =========================================================
  @ApiProperty({ example: true, description: 'Todos los documentos presentados por la parte son válidos y completos.' })
  @IsBoolean()
  documentos_presentados_validos: boolean; 

  @ApiProperty({ example: true, description: 'La notificación a la parte demandada fue correcta y se considera verdadera/válida.' })
  @IsBoolean()
  notificacion_correcta_verdadera: boolean;

  @ApiProperty({ example: false, description: 'La parte no comparece a las audiencias sin justificación adecuada.' })
  @IsBoolean()
  parte_no_comparece_sin_justificacion: boolean;

  @ApiProperty({ example: true, description: 'El testimonio de un testigo clave es considerado relevante y válido.' })
  @IsBoolean()
  testigo_relevante_valido: boolean;

  @ApiProperty({ example: true, description: 'El informe/prueba psicosocial es accesible y usable para el juicio.' })
  @IsBoolean()
  prueba_psicosocial_disponible: boolean;

  @ApiProperty({ example: true, description: 'Existió o se alcanzó un principio de acuerdo o conciliación entre las partes.' })
  @IsBoolean()
  hay_conciliacion_entre_las_partes: boolean;

  @ApiProperty({ example: false, description: 'La evidencia presentada contradice directamente el testimonio de una de las partes.' })
  @IsBoolean()
  evidencia_contradice_testimonio: boolean;

  @ApiProperty({ example: false, description: 'Las pruebas presentadas por una de las partes son insuficientes para sustentar su reclamo.' })
  @IsBoolean()
  pruebas_son_insuficientes: boolean;
}