import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Nna } from "./nna.entity";
import { CreateNnaDto } from "./dto/create-nna.dto";
import { UpdateNnaDto } from "./dto/update-nna.dto";

@Injectable()
export class NnaService {
  constructor(
    @InjectRepository(Nna)
    private readonly nnaRepository: Repository<Nna>
  ) {}

  create(createNnaDto: CreateNnaDto, user: any): Promise<Nna> {
    const nna = this.nnaRepository.create({
      ...createNnaDto,
      create_uid: user,
    });
    return this.nnaRepository.save(nna);
  }

  findAll(): Promise<Nna[]> {
    return this.nnaRepository.find({ relations: ["procesos"] });
  }

  async findOne(id: string): Promise<Nna> {
    const nna = await this.nnaRepository.findOne({
      where: { id },
      relations: ["procesos"],
    });
    if (!nna) {
      throw new NotFoundException(`NNA with ID ${id} not found`);
    }
    return nna;
  }

  async update(id: string, updateNnaDto: UpdateNnaDto): Promise<Nna> {
    const nna = await this.findOne(id);
    this.nnaRepository.merge(nna, updateNnaDto);
    return this.nnaRepository.save(nna);
  }

  async remove(id: string): Promise<void> {
    const nna = await this.findOne(id);
    await this.nnaRepository.remove(nna);
  }
}
