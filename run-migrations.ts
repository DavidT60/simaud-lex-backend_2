// run-migrations.ts - Script to execute migrations
import { AppDataSource } from "./src/data-source";

async function runMigrations() {
  try {
    console.log("Inicializando conexión a la base de datos...");
    await AppDataSource.initialize();
    
    console.log("Ejecutando migraciones pendientes...");
    const migrations = await AppDataSource.runMigrations();
    
    if (migrations.length === 0) {
      console.log("✅ No hay migraciones pendientes.");
    } else {
      console.log(`✅ Se ejecutaron ${migrations.length} migración(es):`);
      migrations.forEach(migration => {
        console.log(`  - ${migration.name}`);
      });
    }
    
    await AppDataSource.destroy();
    console.log("Conexión cerrada.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al ejecutar migraciones:", error);
    process.exit(1);
  }
}

runMigrations();
