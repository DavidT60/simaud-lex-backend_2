
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MotorInferenciaService } from "./motor-inferencia.service";
import { Reglas } from "../proceso-judicial/reglas.entity";
import { RelacionReglasDTO } from "../proceso-judicial/relacion-reglas-dto.entity";
import { HechosSimulacion } from "../proceso-judicial/hechos-simulacion.entity";
import { CasosSimilares } from "../proceso-judicial/casos-similares.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Reglas, RelacionReglasDTO, HechosSimulacion, CasosSimilares])],
  providers: [MotorInferenciaService],
  exports: [MotorInferenciaService],
})
export class MotorInferenciaModule {}
