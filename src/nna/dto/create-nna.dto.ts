import { IsString, IsNotEmpty, IsDateString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNnaDto {
  @ApiProperty({ example: 'Juan Perez', description: 'Nombre completo del NNA' })
  @IsString()
  @IsNotEmpty()
  nombre_completo: string;

  @ApiProperty({ example: '2010-05-15', description: 'Fecha de nacimiento' })
  @IsDateString()
  @IsNotEmpty()
  fecha_nacimiento: string;

  @ApiProperty({ example: 'Quiero vivir con mi mamá', description: 'Opinión del NNA', required: false })
  @IsString()
  @IsOptional()
  opinion_nna?: string;

  @ApiProperty({ example: ['Terapia de lenguaje'], description: 'Necesidades especiales', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  necesidades_especiales?: string[];
}
