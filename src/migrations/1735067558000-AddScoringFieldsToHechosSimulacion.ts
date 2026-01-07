import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddScoringFieldsToHechosSimulacion1735067558000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add scoring result fields to hechos_simulacion table
        await queryRunner.addColumn('hechos_simulacion', new TableColumn({
            name: 'puntuacion_madre',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
        }));

        await queryRunner.addColumn('hechos_simulacion', new TableColumn({
            name: 'puntuacion_padre',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
        }));

        await queryRunner.addColumn('hechos_simulacion', new TableColumn({
            name: 'recomendacion_custodia',
            type: 'varchar',
            length: '50',
            isNullable: true,
        }));

        console.log('✅ Added scoring fields to hechos_simulacion table');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert changes
        await queryRunner.dropColumn('hechos_simulacion', 'recomendacion_custodia');
        await queryRunner.dropColumn('hechos_simulacion', 'puntuacion_padre');
        await queryRunner.dropColumn('hechos_simulacion', 'puntuacion_madre');
        
        console.log('✅ Removed scoring fields from hechos_simulacion table');
    }
}
