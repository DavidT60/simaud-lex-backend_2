import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProcesoJudicialService } from './proceso-judicial.service';
import { CreateProcesoJudicialDto } from './dto/create-proceso-judicial.dto';
import { UpdateProcesoJudicialDto } from './dto/update-proceso-judicial.dto';
import { SimulateSentenciaDto } from './dto/simulate-sentencia.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Procesos Judiciales')
@Controller('proceso-judicial')
export class ProcesoJudicialController {
  constructor(private readonly procesoService: ProcesoJudicialService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo Proceso Judicial' })
  @ApiResponse({ status: 201, description: 'El proceso ha sido creado.' })
  create(@Body() createDto: CreateProcesoJudicialDto) {
    return this.procesoService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los procesos' })
  findAll() {
    return this.procesoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un proceso por ID' })
  findOne(@Param('id') id: string) {
    return this.procesoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un proceso' })
  update(@Param('id') id: string, @Body() updateDto: UpdateProcesoJudicialDto) {
    return this.procesoService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un proceso' })
  remove(@Param('id') id: string) {
    return this.procesoService.remove(id);
  }

  @Post(':id/simular-sentencia')
  @ApiOperation({ summary: 'Generar simulación de sentencia basada en datos del proceso' })
  @ApiResponse({ status: 200, description: 'Simulación generada exitosamente' })
  simularSentencia(
    @Param('id') id: string,
    @Body() simulateDto: SimulateSentenciaDto
  ) {
    return this.procesoService.generarSimulacionSentencia(id, simulateDto);
  }
}
