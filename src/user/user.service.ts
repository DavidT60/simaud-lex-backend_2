import { Injectable, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { User, UserRole } from "./user.entity";
import { CustomError } from "../common/exceptions/custom-exceptions.filter";
import { PersonService } from "src/person/person.service";
import { CreatePersonDto } from "src/person/dto/create-person.dto";
import { hashPassword, comparePassword } from "../common/until/bycryp.pss";
import { UserConfig } from "./user-config.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
    @InjectRepository(UserConfig)
    private configRepo: Repository<UserConfig>,
    private PersonService: PersonService
  ) {}

  async updateConfig(userId: number, configData: Partial<UserConfig>) {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ["config"],
    });
    if (!user)
      throw new CustomError(
        "User not found",
        "USER_NOT_FOUND",
        HttpStatus.NOT_FOUND
      );

    let config = user.config;
    if (!config) {
      config = this.configRepo.create(configData);
      config.user = user;
    } else {
      this.configRepo.merge(config, configData);
    }
    return this.configRepo.save(config);
  }

  async getConfig(userId: number) {
    const user = await this.repo.findOne({
      where: { id: userId },
      relations: ["config"],
    });
    return user?.config || null;
  }

  async singin(data: Partial<User>) {
    try {
      console.log('Calling USER Create Services....');
      let _data = data;
      
      // 1)  DATABASE WILL VALIDATE UNIQUE EMAIL
      // 2) Create Repo Entity
      console.log(_data);
      const user = this.repo.create(_data);
      console.log('Created User Entity:', user);
      
      // 3) Save and Retrun Entity
      let saved_entity = await this.repo.save(user);
      console.log('Saved User Entity:', saved_entity);
      
      // 4) Step #3 Completed | Create Person Entity
      if (saved_entity) {
        const createPersonDto: CreatePersonDto = {
          cedula: 'false',
          nombre_completo: saved_entity.name,
          recursos_economicos: 0,
          ocupacion: '',
          entorno_hogar: '',
        };
        await this.PersonService.create(createPersonDto);
      }
      
      // 5) Return Object
      return saved_entity;
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL duplicate key error
        throw new CustomError(
          'Email already exists',
          'EMAIL_EXISTS',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new CustomError(
        'Could not create user',
        'INTERNAL_ERROR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(data: Partial<User>) {
    console.log("Calling Create Services....");
    // save user log in unser history
    let _data = data;
  }

  findOneEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }
  async findAll() {
    return this.repo.find({
      order: { id: "ASC" },
    });
  }

  async updateRole(id: number, role: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new CustomError(
        "User not found",
        "USER_NOT_FOUND",
        HttpStatus.NOT_FOUND
      );
    }

    // @ts-ignore
    user.role = role;
    return this.repo.save(user);
  }

  async updatePassword(
    id: number,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new CustomError(
        "User not found",
        "USER_NOT_FOUND",
        HttpStatus.NOT_FOUND
      );
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw new CustomError(
        "Current password is incorrect",
        "INVALID_PASSWORD",
        HttpStatus.BAD_REQUEST
      );
    }

    user.password = await hashPassword(newPassword);
    return this.repo.save(user);
  }

  async searchStudents(emailQuery: string) {
    return this.repo.find({
      where: {
        email: Like(`%${emailQuery}%`),
        role: UserRole.ESTUDIANTE,
      },
      select: ["id", "email", "name", "role"],
    });
  }

  async resetUserPassword(userId: number, hashedPassword: string) {
    await this.repo.update(userId, { password: hashedPassword });
  }
}
