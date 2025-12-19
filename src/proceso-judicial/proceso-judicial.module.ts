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
import { Nna } from "../nna/nna.entity";
import { Person } from "../person/person.entity";
import { MotorInferenciaModule } from "../motor-inferencia/motor-inferencia.module";


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
      Nna,
      Person,
      DTOFields,
      RelacionReglasDTO,
    ]),
    MotorInferenciaModule,
  ],
  controllers: [ProcesoJudicialController, ReglasConfigController],
  providers: [ProcesoJudicialService, DtoFieldsService],
  exports: [ProcesoJudicialService, DtoFieldsService],
})
export class ProcesoJudicialModule {}
