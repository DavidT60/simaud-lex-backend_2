import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
  Delete,
} from "@nestjs/common";
import { CourseService } from "./course.service";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiTags("Cursos")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("course")
export class CourseController {
  constructor(private service: CourseService) {}

  @Post()
  create(@Body() data: any, @Request() req) {
    return this.service.create(data, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.service.findAllForProfessor(req.user);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Post(":id/students")
  addStudent(@Param("id") id: string, @Body("email") email: string) {
    return this.service.addStudent(id, email);
  }

  @Get("student/:studentId/cases")
  getStudentCases(@Param("studentId") studentId: string) {
    return this.service.getStudentCases(Number(studentId));
  }

  @Delete(":id/students/:studentId")
  removeStudent(
    @Param("id") id: string,
    @Param("studentId") studentId: string,
    @Request() req
  ) {
    return this.service.removeStudent(id, studentId, req.user);
  }
}
