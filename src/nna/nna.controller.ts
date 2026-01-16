import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from "@nestjs/common";
import { NnaService } from "./nna.service";
import { CreateNnaDto } from "./dto/create-nna.dto";
import { UpdateNnaDto } from "./dto/update-nna.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { AuthGuard } from "@nestjs/passport";

@ApiTags("NNA")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("nna")
export class NnaController {
  constructor(private readonly nnaService: NnaService) {}

  @Post()
  @ApiOperation({ summary: "Crear un nuevo NNA" })
  @ApiResponse({
    status: 201,
    description: "El NNA ha sido creado exitosamente.",
  })
  create(@Body() createNnaDto: CreateNnaDto, @Request() req) {
    return this.nnaService.create(createNnaDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos los NNA" })
  findAll() {
    return this.nnaService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener un NNA por ID" })
  findOne(@Param("id") id: string) {
    return this.nnaService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar un NNA" })
  update(@Param("id") id: string, @Body() updateNnaDto: UpdateNnaDto) {
    return this.nnaService.update(id, updateNnaDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar un NNA" })
  remove(@Param("id") id: string) {
    return this.nnaService.remove(id);
  }
}
