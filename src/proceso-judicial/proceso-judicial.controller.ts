import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { ProcesoJudicialService } from './proceso-judicial.service';
import { CreateProcesoJudicialDto } from './dto/create-proceso-judicial.dto';
import { UpdateProcesoJudicialDto } from './dto/update-proceso-judicial.dto';
import { SimulateSentenciaDto } from './dto/simulate-sentencia.dto';
import { ShareCaseDto } from './dto/share-case.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

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

  @Get('reglas')
  @ApiOperation({ summary: 'Obtener todas las reglas del motor de inferencia' })
  getReglas() {
    return this.procesoService.getAllRules();
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
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generar simulación de sentencia basada en datos del proceso' })
  @ApiResponse({ status: 200, description: 'Simulación generada exitosamente' })
  simularSentencia(
    @Param('id') id: string,
    @Body() simulateDto: SimulateSentenciaDto,
    @Request() req?: any
  ) {
    console.log("Sending simulateDto", simulateDto);
    // Pass user from request if available (authenticated request)
    const user = req?.user;
    return this.procesoService.generarSimulacionSentencia(id, simulateDto, user);
  }

  @Get(':id/historial-simulaciones')
  @ApiOperation({ summary: 'Obtener historial de simulaciones de un proceso' })
  @ApiResponse({ status: 200, description: 'Historial de simulaciones obtenido exitosamente' })
  getHistorialSimulaciones(@Param('id') id: string) {
    return this.procesoService.getHistorialSimulaciones(id);
  }

  @Get('simulacion/:simulacionId')
  @ApiOperation({ summary: 'Obtener detalles de una simulación específica' })
  @ApiResponse({ status: 200, description: 'Simulación encontrada' })
  @ApiResponse({ status: 404, description: 'Simulación no encontrada' })
  getSimulacion(@Param('simulacionId') simulacionId: string) {
    return this.procesoService.getSimulacionById(simulacionId);
  }

  @Get('simulacion/:simulacionId/casos-similares')
  @ApiOperation({ summary: 'Obtener casos similares de una simulación específica' })
  @ApiResponse({ status: 200, description: 'Casos similares encontrados' })
  getSimulacionSimilares(@Param('simulacionId') simulacionId: string) {
    return this.procesoService.getCasosSimilaresBySimulacion(simulacionId);
  }

  @Post(':id/share')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Compartir caso via email' })
  @ApiResponse({ status: 200, description: 'Caso compartido exitosamente' })
  @ApiResponse({ status: 404, description: 'Caso o sentencia no encontrada' })
  shareCase(
    @Param('id') id: string,
    @Body() shareDto: ShareCaseDto,
    @Request() req?: any
  ) {
    const user = req?.user;
    return this.procesoService.shareCase(
      id, 
      shareDto.recipientEmail, 
      shareDto.message,
      user
    );
  }
}
