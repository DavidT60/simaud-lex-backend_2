import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { DtoFieldsService } from './dto-fields.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Configuración Reglas')
@Controller('config-reglas')
export class ReglasConfigController {
  constructor(private readonly dtoFieldsService: DtoFieldsService) {}

  @Get('fields')
  @ApiOperation({ summary: 'Listar todos los campos del DTO' })
  getAllFields() {
    return this.dtoFieldsService.getAllFields();
  }

  @Get('rules')
  @ApiOperation({ summary: 'Listar todas las reglas disponibles' })
  getAllRules() {
    return this.dtoFieldsService.getAllRules();
  }

  @Get('relations/:reglaId')
  @ApiOperation({ summary: 'Obtener relaciones para una regla' })
  getRelations(@Param('reglaId') reglaId: string) {
    return this.dtoFieldsService.getRelationsForRule(reglaId);
  }

  @Post('relations')
  @ApiOperation({ summary: 'Crear una nueva relación Regla-Campo' })
  createRelation(@Body() body: { reglaId: string; fieldId: string; operator: string; value: string }) {
    return this.dtoFieldsService.createRelation(body);
  }

  @Delete('relations/:id')
  @ApiOperation({ summary: 'Eliminar una relación' })
  deleteRelation(@Param('id') id: string) {
    return this.dtoFieldsService.deleteRelation(id);
  }
}
