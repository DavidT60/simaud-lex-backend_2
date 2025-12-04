import { IsString, IsNotEmpty, IsNumber, IsDecimal, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonDto {
  @ApiProperty({ example: '001-0000000-0', description: 'Cédula de identidad' })
  @IsString()
  @IsNotEmpty()
  cedula: string;

  @ApiProperty({ example: 'Maria Rodriguez', description: 'Nombre completo' })
  @IsString()
  @IsNotEmpty()
  nombre_completo: string;

  @ApiProperty({ example: 25000.50, description: 'Recursos económicos mensuales' })
  @IsNumber()
  @Min(0)
  recursos_economicos: number;

  @ApiProperty({ example: 'Ingeniera Civil', description: 'Ocupación' })
  @IsString()
  @IsNotEmpty()
  ocupacion: string;

  @ApiProperty({ example: 'Vive en casa propia con servicios básicos...', description: 'Descripción del entorno del hogar' })
  @IsString()
  @IsNotEmpty()
  entorno_hogar: string;
}
