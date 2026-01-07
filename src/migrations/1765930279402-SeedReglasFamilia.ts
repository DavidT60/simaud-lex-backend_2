import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedReglasFamilia1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "reglas" ("id", "condition", "action", "legal_basis", "domain") VALUES
            -- I. GUARDA Y CUSTODIA (Dominio: GUARDA_MENOR / CUSTODIA)
            (gen_random_uuid(), 'madre_demuestra_estabilidad_emocional = true', 'otorgar_custodia_madre', 'Ley 136-03, Art. 84', 'GUARDA'),
            (gen_random_uuid(), 'ambos_padres_tienen_condiciones_adecuadas = true', 'otorgar_custodia_compartida', 'Ley 136-03, Art. 82', 'GUARDA'),
            (gen_random_uuid(), 'edad_del_menor < 12 AND expresa_preferencia_valida = true', 'considerar_preferencia_menor', 'Ley 136-03, Art. 12', 'GUARDA'),
            (gen_random_uuid(), 'existen_antecedentes_de_violencia = true', 'restringir_custodia_y_visitas', 'Ley 24-97, Art. 309', 'GUARDA'),

            -- II. RÉGIMEN DE VISITAS (Dominio: VISITAS)
            (gen_random_uuid(), 'progenitor_conducta_agresiva_anterior = true', 'visitas_supervisadas', 'Ley 136-03, Art. 98', 'VISITAS'),
            (gen_random_uuid(), 'distancia_entre_domicilios > 100', 'ajustar_frecuencia_visitas_mensual', 'Principio de Logística Familiar', 'VISITAS'),
            (gen_random_uuid(), 'presencia_escolar = IRREGULAR', 'condicionar_visitas_a_mejora_escolar', 'Interés Superior del Niño', 'VISITAS'),

            -- III. ALIMENTOS (Dominio: ALIMENTOS)
            (gen_random_uuid(), 'padre_madre_tiene_ingresos_comprobados = true', 'calcular_pension_sobre_ingresos', 'Ley 136-03, Art. 170', 'ALIMENTOS'),
            (gen_random_uuid(), 'progenitor_obligado_no_tiene_ingresos_formales = true', 'estimar_pension_sobre_capacidad_productiva', 'Ley 136-03, Art. 171', 'ALIMENTOS'),
            (gen_random_uuid(), 'menor_tiene_necesidades_especiales = true', 'incrementar_pension_alimentos', 'Ley 136-03, Art. 175', 'ALIMENTOS'),
            (gen_random_uuid(), 'obligado_demuestra_cargas_familiares_adicionales = true', 'ajustar_monto_proporcional', 'Código Civil, Art. 203', 'ALIMENTOS'),
            (gen_random_uuid(), 'obligado_incumple_reiteradamente_pension = true', 'ordenar_embargo_o_apremio', 'Ley 136-03, Art. 181', 'ALIMENTOS')
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "reglas"`);
  }
}

