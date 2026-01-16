import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProcesoJudicialService } from "./proceso-judicial.service";
import { ProcesoJudicialController } from "./proceso-judicial.controller";
import { ReglasConfigController } from "./reglas-config.controller";
import { ProcesoJudicial } from "./proceso-judicial.entity";
import { ObligacionAlimentaria } from "./obligacion-alimentaria.entity";
import { RegimenVisitas } from "./regimen-visitas.entity";
import { Sentencia } from "./sentencia.entity";
import { ParteProceso } from "./parte-proceso.entity";
import { Reglas } from "./reglas.entity";
import { HechosSimulacion } from "./hechos-simulacion.entity";
import { CasosSimilares } from "./casos-similares.entity"; // New import
import { Nna } from "../nna/nna.entity";
import { Person } from "../person/person.entity";
import { MotorInferenciaModule } from "../motor-inferencia/motor-inferencia.module";
import { AuthModule } from "../auth/auth.module";
import { NotificationModule } from '../notification/notification.module';


import { DTOFields } from "./dto-fields.entity";
import { RelacionReglasDTO } from "./relacion-reglas-dto.entity";
import { DtoFieldsService } from "./dto-fields.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProcesoJudicial,
      ObligacionAlimentaria,
      RegimenVisitas,
      Sentencia,
      ParteProceso,
      Reglas,
      HechosSimulacion,
      CasosSimilares, // New entity
      Nna,
      Person,
      DTOFields,
      RelacionReglasDTO,
    ]),
    MotorInferenciaModule,
    AuthModule,
    NotificationModule,
  ],
  controllers: [ProcesoJudicialController, ReglasConfigController],
  providers: [ProcesoJudicialService, DtoFieldsService],
  exports: [ProcesoJudicialService, DtoFieldsService],
})
export class ProcesoJudicialModule {}
