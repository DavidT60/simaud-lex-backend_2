import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPesoToReglas1734923000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar columna peso con valor por defecto 1
    await queryRunner.query(`
      ALTER TABLE "reglas" 
      ADD COLUMN IF NOT EXISTS "peso" integer NOT NULL DEFAULT 1
    `);

    // 2. Actualizar reglas existentes con pesos apropiados según su importancia
    
    // VIOLENCIA/ABUSO - Peso: 5 (más crítico)
    await queryRunner.query(`
      UPDATE "reglas" 
      SET "peso" = 5 
      WHERE "action" LIKE '%antecedentes_de_violencia%' 
         OR "action" LIKE '%restringir_custodia%'
         OR "condition" LIKE '%antecedentes_de_violencia%'
    `);

    // NEGLIGENCIA - Peso: 4
    await queryRunner.query(`
      UPDATE "reglas" 
      SET "peso" = 4 
      WHERE "condition" LIKE '%negligencia_severa%'
         OR "condition" LIKE '%conducta_agresiva%'
    `);

    // ESTABILIDAD EMOCIONAL - Peso: 3
    await queryRunner.query(`
      UPDATE "reglas" 
      SET "peso" = 3 
      WHERE "condition" LIKE '%estabilidad_emocional%'
         OR "condition" LIKE '%idoneidad_moral%'
         OR "action" LIKE '%otorgar_custodia%'
    `);

    // CAPACIDAD ECONÓMICA - Peso: 2
    await queryRunner.query(`
      UPDATE "reglas" 
      SET "peso" = 2 
      WHERE "condition" LIKE '%ingresos_comprobados%'
         OR "condition" LIKE '%estabilidad_laboral%'
         OR "action" LIKE '%calcular_pension%'
         OR "action" LIKE '%incrementar_pension%'
    `);

    // INCUMPLIMIENTO PENSION - Peso: 3
    await queryRunner.query(`
      UPDATE "reglas" 
      SET "peso" = 3 
      WHERE "condition" LIKE '%incumple%pension%'
         OR "action" LIKE '%embargo_o_apremio%'
    `);
    
    // NECESIDADES ESPECIALES - Peso: 2
    await queryRunner.query(`
      UPDATE "reglas" 
      SET "peso" = 2 
      WHERE "condition" LIKE '%necesidades_especiales%'
         OR "condition" LIKE '%maneja_necesidades%'
    `);

    // DISPONIBILIDAD y VISITAS - Peso: 1 (menos crítico, pero importante)
    await queryRunner.query(`
      UPDATE "reglas" 
      SET "peso" = 1 
      WHERE "domain" = 'VISITAS'
         OR "condition" LIKE '%disponibilidad_tiempo%'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir cambios: eliminar columna peso
    await queryRunner.query(`
      ALTER TABLE "reglas" 
      DROP COLUMN "peso"
    `);
  }
}
