import { IsString, IsNotEmpty, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoProceso, TipoDemanda } from '../enums/proceso.enums';

export class CreateProcesoJudicialDto {
  @ApiProperty({ example: '2025-01-01', description: 'Fecha de inicio del proceso' })
  @IsDateString()
  @IsNotEmpty()
  fecha_inicio: string;

  @ApiProperty({ enum: EstadoProceso, example: EstadoProceso.EN_PROCESO })
  @IsEnum(EstadoProceso)
  @IsNotEmpty()
  estado: EstadoProceso;

  @ApiProperty({ enum: TipoDemanda, example: TipoDemanda.ALIMENTOS })
  @IsEnum(TipoDemanda)
  @IsNotEmpty()
  tipo_demanda: TipoDemanda;

  @ApiProperty({ example: 'uuid-del-nna', description: 'ID del NNA asociado' })
  @IsUUID()
  @IsNotEmpty()
  nnaId: string;
}
