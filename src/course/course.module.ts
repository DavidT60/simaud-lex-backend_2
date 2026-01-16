import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { User } from '../user/user.entity';
import { ProcesoJudicial } from '../proceso-judicial/proceso-judicial.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, User, ProcesoJudicial])
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService]
})
export class CourseModule {}
