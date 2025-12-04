import { PartialType } from '@nestjs/swagger';
import { CreateNnaDto } from './create-nna.dto';

export class UpdateNnaDto extends PartialType(CreateNnaDto) {}
