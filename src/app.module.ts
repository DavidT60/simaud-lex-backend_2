import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { PersonModule } from "./person/person.module";
import { NnaModule } from "./nna/nna.module";
import { ProcesoJudicialModule } from "./proceso-judicial/proceso-judicial.module";
import { CommonModule } from "./common/common.module";
import { ConfigModule } from "@nestjs/config";
import { ConfigService } from "@nestjs/config";
import { MotorInferenciaModule } from "./motor-inferencia/motor-inferencia.module";

// SUPABASE SETUP CONNECTION EXAMPLE
// TypeOrmModule.forRootAsync({
//   imports: [ConfigModule],
//   useFactory: (config: ConfigService) => ({
//     type: "postgres",
//     url: config.get<string>("DATABASE_URL"),
//     autoLoadEntities: true,
//     synchronize: true,
//   }),
//   inject: [ConfigService],
// }),

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "1234",
      database: "my_db_uni_test",
      autoLoadEntities: true,
      synchronize: true, // only for dev
      migrations: ["/src/migrations/*.ts"],
    }),
    UserModule,
    AuthModule,
    PersonModule,
    NnaModule,
    ProcesoJudicialModule,
    CommonModule,
    MotorInferenciaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
