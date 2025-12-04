import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Person } from "./person.entity";
import { CreatePersonDto } from "./dto/create-person.dto";
import { UpdatePersonDto } from "./dto/update-person.dto";

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  create(createPersonDto: CreatePersonDto): Promise<Person> {
    const person = this.personRepository.create(createPersonDto);
    console.log("Creating Person:", person);
    return this.personRepository.save(person);
  }

  findAll(): Promise<Person[]> {
    return this.personRepository.find();
  }

  async findOne(id: string): Promise<Person> {
    const person = await this.personRepository.findOne({
      where: { id },
      relations: ["partesProceso"],
    });
    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    return person;
  }

  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person> {
    const person = await this.findOne(id);
    this.personRepository.merge(person, updatePersonDto);
    return this.personRepository.save(person);
  }

  async remove(id: string): Promise<void> {
    const person = await this.findOne(id);
    await this.personRepository.remove(person);
  }
}
