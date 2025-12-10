import { PartialType } from '@nestjs/swagger';
import { CreateReglasDto } from './create-reglas.dto';

export class UpdateReglasDto extends PartialType(CreateReglasDto) {}
