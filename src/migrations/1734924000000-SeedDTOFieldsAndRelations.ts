import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedDTOFieldsAndRelations1734924000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ====================================================
    // LIMPIEZA PREVIA
    // ====================================================
    await queryRunner.query(`DELETE FROM "relacion_reglas_dto"`);
    await queryRunner.query(`DELETE FROM "dto_fields"`);
    
    // ====================================================
    // PARTE 1: POPULAR DTO_FIELDS CON CAMPOS DEL DTO
    // ====================================================
    await queryRunner.query(`
      INSERT INTO "dto_fields" ("id", "fieldName", "label", "fieldType") VALUES
      -- Campos de la MADRE
      (gen_random_uuid(), 'madre_demuestra_estabilidad_emocional', 'Madre: Estabilidad Emocional', 'BOOLEAN'),
      (gen_random_uuid(), 'madre_tiene_antecedentes_de_violencia', 'Madre: Antecedentes de Violencia', 'BOOLEAN'),
      (gen_random_uuid(), 'madre_evidencia_negligencia_severa', 'Madre: Negligencia Severa', 'BOOLEAN'),
      (gen_random_uuid(), 'madre_conducta_agresiva_anterior', 'Madre: Conducta Agresiva', 'BOOLEAN'),
      (gen_random_uuid(), 'madre_reportes_psicosociales_negativos', 'Madre: Reportes Negativos', 'BOOLEAN'),
      (gen_random_uuid(), 'madre_tiene_ingresos_comprobados', 'Madre: Ingresos Comprobados', 'BOOLEAN'),
      (gen_random_uuid(), 'madre_sin_ingresos_formales', 'Madre: Sin Ingresos Formales', 'BOOLEAN'),
      (gen_random_uuid(), 'madre_incumple_pension', 'Madre: Incumple Pensión', 'BOOLEAN'),
      (gen_random_uuid(), 'madre_maneja_necesidades_especiales', 'Madre: Maneja Necesidades Especiales', 'BOOLEAN'),
      (gen_random_uuid(), 'madre_cargas_familiares_adicionales', 'Madre: Cargas Familiares', 'BOOLEAN'),
      
      -- Campos del PADRE
      (gen_random_uuid(), 'padre_demuestra_estabilidad_emocional', 'Padre: Estabilidad Emocional', 'BOOLEAN'),
      (gen_random_uuid(), 'padre_tiene_antecedentes_de_violencia', 'Padre: Antecedentes de Violencia', 'BOOLEAN'),
      (gen_random_uuid(), 'padre_evidencia_negligencia_severa', 'Padre: Negligencia Severa', 'BOOLEAN'),
      (gen_random_uuid(), 'padre_conducta_agresiva_anterior', 'Padre: Conducta Agresiva', 'BOOLEAN'),
      (gen_random_uuid(), 'padre_reportes_psicosociales_negativos', 'Padre: Reportes Negativos', 'BOOLEAN'),
      (gen_random_uuid(), 'padre_tiene_ingresos_comprobados', 'Padre: Ingresos Comprobados', 'BOOLEAN'),
      (gen_random_uuid(), 'padre_sin_ingresos_formales', 'Padre: Sin Ingresos Formales', 'BOOLEAN'),
      (gen_random_uuid(), 'padre_incumple_pension', 'Padre: Incumple Pensión', 'BOOLEAN'),
      (gen_random_uuid(), 'padre_maneja_necesidades_especiales', 'Padre: Maneja Necesidades Especiales', 'BOOLEAN'),
      (gen_random_uuid(), 'padre_cargas_familiares_adicionales', 'Padre: Cargas Familiares', 'BOOLEAN'),
      
      -- Campos GENERALES
      (gen_random_uuid(), 'ambos_padres_tienen_condiciones_adecuadas', 'Ambos Padres: Condiciones Adecuadas', 'BOOLEAN'),
      (gen_random_uuid(), 'menor_tiene_necesidades_especiales', 'Menor: Necesidades Especiales', 'BOOLEAN'),
      (gen_random_uuid(), 'expresa_preferencia_valida', 'Menor: Preferencia Válida', 'BOOLEAN'),
      (gen_random_uuid(), 'tiene_madurez_suficiente', 'Menor: Madurez Suficiente', 'BOOLEAN'),
      (gen_random_uuid(), 'edad_del_menor', 'Edad del Menor', 'NUMBER'),
      (gen_random_uuid(), 'distancia_entre_domicilios', 'Distancia entre Domicilios (km)', 'NUMBER'),
      (gen_random_uuid(), 'presencia_escolar', 'Presencia Escolar', 'STRING')
    `);

    // ====================================================
    // PARTE 2: ACTUALIZAR REGLAS EXISTENTES Y CREAR NUEVAS
    // ====================================================
    
    // Eliminar reglas obsoletas con campos antiguos
    await queryRunner.query(`
      DELETE FROM "reglas" 
      WHERE "condition" LIKE '%existen_antecedentes_de_violencia%'
         OR "condition" LIKE '%padre_madre_tiene_ingresos_comprobados%'
         OR "condition" LIKE '%progenitor_obligado_no_tiene_ingresos_formales%'
         OR "condition" LIKE '%obligado_demuestra_cargas_familiares%'
         OR "condition" LIKE '%obligado_incumple_reiteradamente_pension%'
         OR "condition" LIKE '%progenitor_conducta_agresiva_anterior%'
    `);

    // Insertar reglas nuevas separadas por progenitor
    await queryRunner.query(`
      INSERT INTO "reglas" ("id", "condition", "action", "legal_basis", "domain", "peso") VALUES
      -- CUSTODIA MADRE
      (gen_random_uuid(), 'madre_demuestra_estabilidad_emocional', 'favorecer_custodia_madre', 'Ley 136-03, Art. 84', 'GUARDA', 3),
      (gen_random_uuid(), 'madre_tiene_antecedentes_de_violencia', 'restriccion_custodia_madre', 'Ley 24-97, Art. 309', 'GUARDA', 5),
      (gen_random_uuid(), 'madre_evidencia_negligencia_severa', 'restriccion_custodia_madre', 'Protección del Menor', 'GUARDA', 4),
      (gen_random_uuid(), 'madre_maneja_necesidades_especiales', 'favorecer_custodia_madre', 'Ley 136-03', 'GUARDA', 2),
      
      -- CUSTODIA PADRE
      (gen_random_uuid(), 'padre_demuestra_estabilidad_emocional', 'favorecer_custodia_padre', 'Ley 136-03, Art. 84', 'GUARDA', 3),
      (gen_random_uuid(), 'padre_tiene_antecedentes_de_violencia', 'restriccion_custodia_padre', 'Ley 24-97, Art. 309', 'GUARDA', 5),
      (gen_random_uuid(), 'padre_evidencia_negligencia_severa', 'restriccion_custodia_padre', 'Protección del Menor', 'GUARDA', 4),
      (gen_random_uuid(), 'padre_maneja_necesidades_especiales', 'favorecer_custodia_padre', 'Ley 136-03', 'GUARDA', 2),
      
      -- PENSIÓN ALIMENTICIA
      (gen_random_uuid(), 'madre_tiene_ingresos_comprobados', 'calcular_pension_madre', 'Ley 136-03, Art. 170', 'ALIMENTOS', 2),
      (gen_random_uuid(), 'padre_tiene_ingresos_comprobados', 'calcular_pension_padre', 'Ley 136-03, Art. 170', 'ALIMENTOS', 2),
      (gen_random_uuid(), 'madre_sin_ingresos_formales', 'estimar_capacidad_productiva_madre', 'Ley 136-03, Art. 171', 'ALIMENTOS', 2),
      (gen_random_uuid(), 'padre_sin_ingresos_formales', 'estimar_capacidad_productiva_padre', 'Ley 136-03, Art. 171', 'ALIMENTOS', 2),
      (gen_random_uuid(), 'madre_incumple_pension', 'medidas_coercitivas_madre', 'Ley 136-03, Art. 181', 'ALIMENTOS', 3),
      (gen_random_uuid(), 'padre_incumple_pension', 'medidas_coercitivas_padre', 'Ley 136-03, Art. 181', 'ALIMENTOS', 3),
      (gen_random_uuid(), 'madre_cargas_familiares_adicionales', 'ajustar_monto_madre', 'Código Civil, Art. 203', 'ALIMENTOS', 1),
      (gen_random_uuid(), 'padre_cargas_familiares_adicionales', 'ajustar_monto_padre', 'Código Civil, Art. 203', 'ALIMENTOS', 1),
      
      -- VISITAS
      (gen_random_uuid(), 'madre_conducta_agresiva_anterior', 'visitas_supervisadas_madre', 'Ley 136-03, Art. 98', 'VISITAS', 4),
      (gen_random_uuid(), 'padre_conducta_agresiva_anterior', 'visitas_supervisadas_padre', 'Ley 136-03, Art. 98', 'VISITAS', 4)
    `);

    // ====================================================
    // PARTE 3: CREAR RELACIONES EN RELACION_REGLAS_DTO
    // ====================================================
    
    // Relaciones para reglas de MADRE
    await queryRunner.query(`
      INSERT INTO "relacion_reglas_dto" ("id", "reglaId", "dtoFieldId", "operator", "value")
      SELECT 
        gen_random_uuid(),
        r.id,
        df.id,
        'EQUALS',
        'true'
      FROM "reglas" r
      CROSS JOIN "dto_fields" df
      WHERE r.condition = 'madre_demuestra_estabilidad_emocional'
        AND df."fieldName" = 'madre_demuestra_estabilidad_emocional'
    `);

    await queryRunner.query(`
      INSERT INTO "relacion_reglas_dto" ("id", "reglaId", "dtoFieldId", "operator", "value")
      SELECT 
        gen_random_uuid(),
        r.id,
        df.id,
        'EQUALS',
        'true'
      FROM "reglas" r
      CROSS JOIN "dto_fields" df
      WHERE r.condition = 'madre_tiene_antecedentes_de_violencia'
        AND df."fieldName" = 'madre_tiene_antecedentes_de_violencia'
    `);

    await queryRunner.query(`
      INSERT INTO "relacion_reglas_dto" ("id", "reglaId", "dtoFieldId", "operator", "value")
      SELECT 
        gen_random_uuid(),
        r.id,
        df.id,
        'EQUALS',
        'true'
      FROM "reglas" r
      CROSS JOIN "dto_fields" df
      WHERE r.condition = 'madre_evidencia_negligencia_severa'
        AND df."fieldName" = 'madre_evidencia_negligencia_severa'
    `);

    await queryRunner.query(`
      INSERT INTO "relacion_reglas_dto" ("id", "reglaId", "dtoFieldId", "operator", "value")
      SELECT 
        gen_random_uuid(),
        r.id,
        df.id,
        'EQUALS',
        'true'
      FROM "reglas" r
      CROSS JOIN "dto_fields" df
      WHERE r.condition = 'madre_maneja_necesidades_especiales'
        AND df."fieldName" = 'madre_maneja_necesidades_especiales'
    `);

    await queryRunner.query(`
      INSERT INTO "relacion_reglas_dto" ("id", "reglaId", "dtoFieldId", "operator", "value")
      SELECT 
        gen_random_uuid(),
        r.id,
        df.id,
        'EQUALS',
        'true'
      FROM "reglas" r
      CROSS JOIN "dto_fields" df
      WHERE r.condition = 'madre_tiene_ingresos_comprobados'
        AND df."fieldName" = 'madre_tiene_ingresos_comprobados'
    `);

    // Relaciones para reglas de PADRE
    await queryRunner.query(`
      INSERT INTO "relacion_reglas_dto" ("id", "reglaId", "dtoFieldId", "operator", "value")
      SELECT 
        gen_random_uuid(),
        r.id,
        df.id,
        'EQUALS',
        'true'
      FROM "reglas" r
      CROSS JOIN "dto_fields" df
      WHERE r.condition = 'padre_demuestra_estabilidad_emocional'
        AND df."fieldName" = 'padre_demuestra_estabilidad_emocional'
    `);

    await queryRunner.query(`
      INSERT INTO "relacion_reglas_dto" ("id", "reglaId", "dtoFieldId", "operator", "value")
      SELECT 
        gen_random_uuid(),
        r.id,
        df.id,
        'EQUALS',
        'true'
      FROM "reglas" r
      CROSS JOIN "dto_fields" df
      WHERE r.condition = 'padre_tiene_antecedentes_de_violencia'
        AND df."fieldName" = 'padre_tiene_antecedentes_de_violencia'
    `);

    await queryRunner.query(`
      INSERT INTO "relacion_reglas_dto" ("id", "reglaId", "dtoFieldId", "operator", "value")
      SELECT 
        gen_random_uuid(),
        r.id,
        df.id,
        'EQUALS',
        'true'
      FROM "reglas" r
      CROSS JOIN "dto_fields" df
      WHERE r.condition = 'padre_evidencia_negligencia_severa'
        AND df."fieldName" = 'padre_evidencia_negligencia_severa'
    `);

    await queryRunner.query(`
      INSERT INTO "relacion_reglas_dto" ("id", "reglaId", "dtoFieldId", "operator", "value")
      SELECT 
        gen_random_uuid(),
        r.id,
        df.id,
        'EQUALS',
        'true'
      FROM "reglas" r
      CROSS JOIN "dto_fields" df
      WHERE r.condition = 'padre_maneja_necesidades_especiales'
        AND df."fieldName" = 'padre_maneja_necesidades_especiales'
    `);

    await queryRunner.query(`
      INSERT INTO "relacion_reglas_dto" ("id", "reglaId", "dtoFieldId", "operator", "value")
      SELECT 
        gen_random_uuid(),
        r.id,
        df.id,
        'EQUALS',
        'true'
      FROM "reglas" r
      CROSS JOIN "dto_fields" df
      WHERE r.condition = 'padre_tiene_ingresos_comprobados'
        AND df."fieldName" = 'padre_tiene_ingresos_comprobados'
    `);

    // Relación para regla GENERAL (custodia compartida)
    await queryRunner.query(`
      INSERT INTO "relacion_reglas_dto" ("id", "reglaId", "dtoFieldId", "operator", "value")
      SELECT 
        gen_random_uuid(),
        r.id,
        df.id,
        'EQUALS',
        'true'
      FROM "reglas" r
      CROSS JOIN "dto_fields" df
      WHERE r.condition = 'ambos_padres_tienen_condiciones_adecuadas = true'
        AND df."fieldName" = 'ambos_padres_tienen_condiciones_adecuadas'
    `);

    // Relación para menor con necesidades especiales
    await queryRunner.query(`
      INSERT INTO "relacion_reglas_dto" ("id", "reglaId", "dtoFieldId", "operator", "value")
      SELECT 
        gen_random_uuid(),
        r.id,
        df.id,
        'EQUALS',
        'true'
      FROM "reglas" r
      CROSS JOIN "dto_fields" df
      WHERE r.condition = 'menor_tiene_necesidades_especiales = true'
        AND df."fieldName" = 'menor_tiene_necesidades_especiales'
    `);

    // Relación para edad del menor (regla compuesta)
    await queryRunner.query(`
      INSERT INTO "relacion_reglas_dto" ("id", "reglaId", "dtoFieldId", "operator", "value")
      SELECT 
        gen_random_uuid(),
        r.id,
        df."id",
        'LESS_THAN',
        '12'
      FROM "reglas" r
      CROSS JOIN "dto_fields" df
      WHERE r.condition LIKE '%edad_del_menor < 12%'
        AND df."fieldName" = 'edad_del_menor'
    `);

    await queryRunner.query(`
      INSERT INTO "relacion_reglas_dto" ("id", "reglaId", "dtoFieldId", "operator", "value")
      SELECT 
        gen_random_uuid(),
        r.id,
        df.id,
        'EQUALS',
        'true'
      FROM "reglas" r
      CROSS JOIN "dto_fields" df
      WHERE r.condition LIKE '%edad_del_menor < 12%'
        AND df."fieldName" = 'expresa_preferencia_valida'
    `);

    // Relación para distancia entre domicilios
    await queryRunner.query(`
      INSERT INTO "relacion_reglas_dto" ("id", "reglaId", "dtoFieldId", "operator", "value")
      SELECT 
        gen_random_uuid(),
        r.id,
        df.id,
        'GREATER_THAN',
        '100'
      FROM "reglas" r
      CROSS JOIN "dto_fields" df
      WHERE r.condition LIKE '%distancia_entre_domicilios > 100%'
        AND df."fieldName" = 'distancia_entre_domicilios'
    `);

    // Relación para presencia escolar
    await queryRunner.query(`
      INSERT INTO "relacion_reglas_dto" ("id", "reglaId", "dtoFieldId", "operator", "value")
      SELECT 
        gen_random_uuid(),
        r.id,
        df.id,
        'EQUALS',
        'IRREGULAR'
      FROM "reglas" r
      CROSS JOIN "dto_fields" df
      WHERE r.condition LIKE '%presencia_escolar = IRREGULAR%'
        AND df."fieldName" = 'presencia_escolar'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar relaciones
    await queryRunner.query(`DELETE FROM "relacion_reglas_dto"`);
    
    // Eliminar campos DTO
    await queryRunner.query(`DELETE FROM "dto_fields"`);
    
    // Opcional: restaurar reglas antiguas
    // await queryRunner.query(`DELETE FROM "reglas"`);
  }
}
