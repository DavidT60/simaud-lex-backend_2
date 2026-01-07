// src/data-source.ts
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres", // Según tu captura
  password: "1234", // Según tu captura
  database: "my_db_uni", // Según tu captura
  synchronize: false,
  logging: true,
  migrations: ["src/migrations/*.ts"],
});
