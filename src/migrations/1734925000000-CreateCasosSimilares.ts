import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCasosSimilares1734925000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "casos_similares" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "casoActualId" uuid NOT NULL,
        "casoSimilarId" uuid NOT NULL,
        "scoreSimulitud" numeric(5,2) NOT NULL,
        "camposCoincidentes" jsonb NOT NULL,
        "puntuacionMadreSimilar" integer,
        "puntuacionPadreSimilar" integer,
        "recomendacionSimilar" character varying,
        "fechaComparacion" timestamp with time zone NOT NULL DEFAULT now(),
        CONSTRAINT "FK_casos_similares_caso_actual" FOREIGN KEY ("casoActualId") 
          REFERENCES "hechos_simulacion"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_casos_similares_caso_similar" FOREIGN KEY ("casoSimilarId") 
          REFERENCES "hechos_simulacion"("id") ON DELETE CASCADE
      )
    `);

    // Crear índices para mejorar performance de búsqueda
    await queryRunner.query(`
      CREATE INDEX "IDX_casos_similares_caso_actual" ON "casos_similares" ("casoActualId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_casos_similares_score" ON "casos_similares" ("scoreSimulitud" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_casos_similares_score"`);
    await queryRunner.query(`DROP INDEX "IDX_casos_similares_caso_actual"`);
    await queryRunner.query(`DROP TABLE "casos_similares"`);
  }
}
