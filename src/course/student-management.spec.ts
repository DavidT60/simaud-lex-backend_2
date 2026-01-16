import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { User, UserRole } from '../user/user.entity';
import { ProcesoJudicial } from '../proceso-judicial/proceso-judicial.entity';
import { CustomError } from '../common/exceptions/custom-exceptions.filter';
import { HttpStatus } from '@nestjs/common';

describe('CourseService - Student Management', () => {
  let service: CourseService;
  let courseRepo: any;
  let userRepo: any;

  const mockCourseRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockProfessor = {
    id: 1,
    role: UserRole.PROFESOR,
    email: 'prof@test.com',
  } as User;

  const mockStudent = {
    id: 2,
    role: UserRole.ESTUDIANTE,
    email: 'student@test.com',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(ProcesoJudicial),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
    courseRepo = module.get(getRepositoryToken(Course));
    userRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addStudent', () => {
    it('should successfully add a student to a course', async () => {
      const course = { id: 'c1', students: [] };
      courseRepo.findOne.mockResolvedValue(course);
      userRepo.findOne.mockResolvedValue(mockStudent);
      courseRepo.save.mockImplementation((c) => c);

      await service.addStudent('c1', 'student@test.com');

      expect(course.students).toHaveLength(1);
      expect(course.students[0]).toEqual(mockStudent);
      expect(courseRepo.save).toHaveBeenCalled();
    });

    it('should throw error if student already in course', async () => {
      const course = { id: 'c1', students: [mockStudent] };
      courseRepo.findOne.mockResolvedValue(course);
      userRepo.findOne.mockResolvedValue(mockStudent);

      await expect(
        service.addStudent('c1', 'student@test.com')
      ).rejects.toThrow(CustomError);
    });

    it('should throw error if user is not a student', async () => {
        const professorUser = { ...mockProfessor };
        courseRepo.findOne.mockResolvedValue({ id: 'c1', students: [] });
        userRepo.findOne.mockResolvedValue(professorUser);

        await expect(
            service.addStudent('c1', 'prof@test.com')
        ).rejects.toThrow(CustomError);
    });
  });

  describe('removeStudent', () => {
    it('should successfully remove a student from a course', async () => {
      const course = { 
          id: 'c1', 
          professor: mockProfessor,
          students: [mockStudent] 
      };
      courseRepo.findOne.mockResolvedValue(course);
      courseRepo.save.mockImplementation((c) => c);

      await service.removeStudent('c1', '2', mockProfessor);

      expect(course.students).toHaveLength(0);
      expect(courseRepo.save).toHaveBeenCalled();
    });

    it('should throw error if unauthorized user tries to remove student', async () => {
      const otherProf = { ...mockProfessor, id: 99 };
      const course = { 
          id: 'c1', 
          professor: mockProfessor, 
          students: [mockStudent] 
      };
      courseRepo.findOne.mockResolvedValue(course);

      await expect(
        service.removeStudent('c1', '2', otherProf)
      ).rejects.toThrow(CustomError);
    });
  });
});
