import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoDemanda } from '../enums/proceso.enums';

export class CreateReglasDto {
  @ApiProperty({ example: 'IF edad_del_menor > 7 AND preferencia_valida == true', description: 'Condición que debe cumplirse para activar la regla' })
  @IsString()
  @IsNotEmpty()
  condition: string;

  @ApiProperty({ example: 'Otorgar custodia según preferencia del menor', description: 'Acción a ejecutar cuando se cumple la condición' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ example: 'Artículo 123 del Código de Familia', description: 'Fundamento legal de la regla' })
  @IsString()
  @IsNotEmpty()
  legal_basis: string;

  @ApiProperty({ enum: TipoDemanda, example: TipoDemanda.GUARDA, description: 'Dominio o tipo de demanda al que aplica esta regla (GUARDA, ALIMENTOS, VISITAS)' })
  @IsEnum(TipoDemanda)
  @IsNotEmpty()
  domain: TipoDemanda;
}
