import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PersonService } from "./person.service";
import { Person } from "./person.entity";
import { PersonController } from './person.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Person])],
  providers: [PersonService],
  exports: [PersonService],
  controllers: [PersonController],
})
export class PersonModule {}
