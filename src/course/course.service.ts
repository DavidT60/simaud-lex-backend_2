import { Injectable, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Course } from "./course.entity";
import { User, UserRole } from "../user/user.entity";
import { CustomError } from "../common/exceptions/custom-exceptions.filter";
import { ProcesoJudicial } from "../proceso-judicial/proceso-judicial.entity";

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private repo: Repository<Course>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(ProcesoJudicial)
    private procesoRepo: Repository<ProcesoJudicial>
  ) {}

  async create(data: Partial<Course>, professor: User) {
    if (
      professor.role !== UserRole.PROFESOR &&
      professor.role !== UserRole.ADMIN
    ) {
      throw new CustomError(
        "Only professors can create courses",
        "UNAUTHORIZED",
        HttpStatus.FORBIDDEN
      );
    }
    const course = this.repo.create({ ...data, professor });
    return this.repo.save(course);
  }

  async findAllForProfessor(professor: User) {
    if (professor.role === UserRole.ADMIN) {
      return this.repo.find({ relations: ["professor", "students"] });
    }
    return this.repo.find({
      where: { professor: { id: professor.id } },
      relations: ["professor", "students"],
    });
  }

  async findOne(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ["professor", "students"],
    });
  }

  async addStudent(courseId: string, studentEmail: string) {
    const course = await this.repo.findOne({
      where: { id: courseId },
      relations: ["students"],
    });
    if (!course)
      throw new CustomError(
        "Course not found",
        "NOT_FOUND",
        HttpStatus.NOT_FOUND
      );

    const student = await this.userRepo.findOne({
      where: { email: studentEmail },
    });
    if (!student)
      throw new CustomError(
        "Student not found",
        "NOT_FOUND",
        HttpStatus.NOT_FOUND
      );

    if (student.role !== UserRole.ESTUDIANTE) {
      throw new CustomError(
        "User is not a student",
        "INVALID_ROLE",
        HttpStatus.BAD_REQUEST
      );
    }

    // Check if duplicate
    if (course.students.find((s) => s.id === student.id)) {
      throw new CustomError(
        "Student already in course",
        "DUPLICATE",
        HttpStatus.CONFLICT
      );
    }

    course.students.push(student);
    return this.repo.save(course);
  }

  async getStudentCases(studentId: number) {
    // Ensure student exists
    const student = await this.userRepo.findOne({ where: { id: studentId } });
    if (!student)
      throw new CustomError(
        "Student not found",
        "NOT_FOUND",
        HttpStatus.NOT_FOUND
      );

    return this.procesoRepo.find({
      where: { create_uid: { id: studentId } },
      relations: ["nna"],
    });
  }
  async removeStudent(courseId: string, studentId: string, professor: User) {
    if (professor.role !== UserRole.PROFESOR && professor.role !== UserRole.ADMIN) {
      throw new CustomError(
        "Only professors/admins can remove students",
        "UNAUTHORIZED",
        HttpStatus.FORBIDDEN
      );
    }

    const course = await this.repo.findOne({
      where: { id: courseId },
      relations: ["students", "professor"],
    });

    if (!course) {
      throw new CustomError(
        "Course not found",
        "NOT_FOUND",
        HttpStatus.NOT_FOUND
      );
    }

    // Check ownership if not admin
    if (professor.role !== UserRole.ADMIN && course.professor.id !== professor.id) {
      throw new CustomError(
        "You can only manage your own courses",
        "UNAUTHORIZED",
        HttpStatus.FORBIDDEN
      );
    }

    course.students = course.students.filter((s) => s.id !== Number(studentId));
    return this.repo.save(course);
  }
}
