import { PartialType } from '@nestjs/swagger';
import { CreateProcesoJudicialDto } from './create-proceso-judicial.dto';

export class UpdateProcesoJudicialDto extends PartialType(CreateProcesoJudicialDto) {}
