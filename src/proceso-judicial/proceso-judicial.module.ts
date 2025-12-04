import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcesoJudicialService } from './proceso-judicial.service';
import { ProcesoJudicialController } from './proceso-judicial.controller';
import { ProcesoJudicial } from './proceso-judicial.entity';
import { ObligacionAlimentaria } from './obligacion-alimentaria.entity';
import { RegimenVisitas } from './regimen-visitas.entity';
import { Sentencia } from './sentencia.entity';
import { ParteProceso } from './parte-proceso.entity';
import { Nna } from '../nna/nna.entity';
import { Person } from '../person/person.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProcesoJudicial,
      ObligacionAlimentaria,
      RegimenVisitas,
      Sentencia,
      ParteProceso,
      Nna,
      Person
    ])
  ],
  controllers: [ProcesoJudicialController],
  providers: [ProcesoJudicialService],
  exports: [ProcesoJudicialService]
})
export class ProcesoJudicialModule {}
