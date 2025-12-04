import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NnaController } from './nna.controller';
import { NnaService } from './nna.service';
import { Nna } from './nna.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nna])],
  controllers: [NnaController],
  providers: [NnaService],
  exports: [NnaService],
})
export class NnaModule {}
