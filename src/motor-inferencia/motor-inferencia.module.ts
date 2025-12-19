
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MotorInferenciaService } from "./motor-inferencia.service";
import { Reglas } from "../proceso-judicial/reglas.entity";
import { RelacionReglasDTO } from "../proceso-judicial/relacion-reglas-dto.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Reglas, RelacionReglasDTO])],
  providers: [MotorInferenciaService],
  exports: [MotorInferenciaService],
})
export class MotorInferenciaModule {}
