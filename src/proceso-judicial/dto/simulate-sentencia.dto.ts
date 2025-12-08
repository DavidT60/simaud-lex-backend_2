import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SimulateSentenciaDto {
  @ApiProperty({ 
    example: 15000, 
    description: 'Monto que el usuario desea simular (opcional)', 
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  montoSolicitado?: number;

  @ApiProperty({ 
    example: 'El NNA requiere terapia especializada adicional', 
    description: 'Notas sobre necesidades especiales adicionales', 
    required: false 
  })
  @IsOptional()
  @IsString()
  notasAdicionales?: string;

  @ApiProperty({ 
    example: 80000, 
    description: 'Estimación actualizada de recursos del demandado', 
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  recursosDemandadoEstimados?: number;
}
