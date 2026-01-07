import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProcesoJudicial } from "./proceso-judicial.entity";
import { Sentencia } from "./sentencia.entity";
import { CreateProcesoJudicialDto } from "./dto/create-proceso-judicial.dto";
import { UpdateProcesoJudicialDto } from "./dto/update-proceso-judicial.dto";
import { SimulateSentenciaDto } from "./dto/simulate-sentencia.dto";
import { HechosSimulacion } from "./hechos-simulacion.entity";
import { CasosSimilares } from "./casos-similares.entity";
import { MotorInferenciaService } from "../motor-inferencia/motor-inferencia.service";
import { Nna } from "../nna/nna.entity";
import { EstadoProceso, RolParte } from "./enums/proceso.enums";
// import nodemailer from "nodemailer";
import * as nodemailer from "nodemailer";
// import { createTransport } from "nodemailer";

@Injectable()
export class ProcesoJudicialService {
  constructor(
    @InjectRepository(ProcesoJudicial)
    private readonly procesoRepository: Repository<ProcesoJudicial>,
    @InjectRepository(Nna)
    private readonly nnaRepository: Repository<Nna>,
    @InjectRepository(HechosSimulacion)
    private readonly hechosSimulacionRepository: Repository<HechosSimulacion>,
    @InjectRepository(Sentencia)
    private readonly sentenciaRepository: Repository<Sentencia>,
    @InjectRepository(CasosSimilares)
    private readonly casosSimilaresRepository: Repository<CasosSimilares>,
    private readonly motorInferenciaService: MotorInferenciaService
  ) {}

  async create(
    createDto: CreateProcesoJudicialDto,
    user?: any
  ): Promise<ProcesoJudicial> {
    const nna = await this.nnaRepository.findOne({
      where: { id: createDto.nnaId },
    });
    if (!nna) {
      throw new NotFoundException(`NNA with ID ${createDto.nnaId} not found`);
    }

    const proceso = this.procesoRepository.create({
      ...createDto,
      nna,
      create_uid: user,
    });
    return this.procesoRepository.save(proceso);
  }

  findAll(): Promise<ProcesoJudicial[]> {
    return this.procesoRepository.find({
      relations: ["nna", "partes", "partes.persona"],
    });
  }

  async findOne(id: string): Promise<ProcesoJudicial> {
    const proceso = await this.procesoRepository.findOne({
      where: { id },
      relations: [
        "nna",
        "partes",
        "partes.persona",
        "obligaciones",
        "regimenesVisita",
        "sentencia",
      ],
    });
    if (!proceso) {
      throw new NotFoundException(`ProcesoJudicial with ID ${id} not found`);
    }
    return proceso;
  }

  async update(
    id: string,
    updateDto: UpdateProcesoJudicialDto
  ): Promise<ProcesoJudicial> {
    const proceso = await this.findOne(id);
    this.procesoRepository.merge(proceso, updateDto);
    return this.procesoRepository.save(proceso);
  }

  async remove(id: string): Promise<void> {
    const proceso = await this.findOne(id);
    await this.procesoRepository.remove(proceso);
  }

  async generarSimulacionSentencia(
    id: string,
    simulateDto: SimulateSentenciaDto,
    user?: any
  ): Promise<any> {
    const proceso = await this.findOne(id);
    console.log("Proceso encontrado para simulación:", proceso);

    // Guardar los hechos de la simulación en la base de datos
    const hechosSimulacion = this.hechosSimulacionRepository.create({
      proceso,
      ...simulateDto,
      ...(user ? { create_uid: user } : {}), // Only set if user exists
    });
    console.log(hechosSimulacion);

    console.log("Guardando hechos de simulación...");
    let hechosSimulacionSaved =
      await this.hechosSimulacionRepository.save(hechosSimulacion);

    // 1. MOTOR DE RAZONAMIENTO (Con integración LLM)
    console.log("Procesando caso con motor de inferencia...");
    const nnaNombre = proceso.nna
      ? proceso.nna.nombre_completo
      : "Menor involucrado";
    const resultadoMotor = await this.motorInferenciaService.procesarCaso(
      simulateDto,
      nnaNombre,
      hechosSimulacionSaved.id // Pasar el ID para guardar casos similares
    );

    console.log("Resultado del motor de inferencia:", resultadoMotor);

    // Actualizar los hechos de simulación con los resultados del motor
    hechosSimulacionSaved.puntuacion_madre = resultadoMotor.puntuacionMadre;
    hechosSimulacionSaved.puntuacion_padre = resultadoMotor.puntuacionPadre;
    hechosSimulacionSaved.recomendacion_custodia =
      resultadoMotor.recomendacionCustodia;
    let hechosSimulacion_results = await this.hechosSimulacionRepository.save(
      hechosSimulacionSaved
    );

    console.log(hechosSimulacion_results);

    try {
      // 2. GUARDAR SENTENCIA EN BASE DE DATOS
      let sentencia = await this.sentenciaRepository.findOne({
        where: { proceso: { id: proceso.id } },
      });

      console.log("Sentencia encontrada:", sentencia);

      if (!sentencia) {
        console.log(`Creating Setence..... ${proceso.id}`);
        sentencia = this.sentenciaRepository.create({
          proceso: proceso,
          procesoId: proceso.id, // Explicitly set relation
          fallo: `Custodia recomendada: ${resultadoMotor.recomendacionCustodia}\nPuntuación Madre: ${resultadoMotor.puntuacionMadre}\nPuntuación Padre: ${resultadoMotor.puntuacionPadre}\n\n${resultadoMotor.sentenciaFormal || ''}`,
          created_by_name: user?.name || "Sistema",
          created_by_email: user?.email || "sistema@simaud-lex.com",
          ...(user ? { create_uid: user } : {}),
        });
        console.log("Sentencia object created (pre-save):", sentencia);
      } else {
        console.log("Ya existe procede a sobreescribir....");
        sentencia.fallo = `Custodia recomendada: ${resultadoMotor.recomendacionCustodia}\nPuntuación Madre: ${resultadoMotor.puntuacionMadre}\nPuntuación Padre: ${resultadoMotor.puntuacionPadre}\n\n${resultadoMotor.sentenciaFormal || ''}`;
        // Ensure relation is preserved/set
        sentencia.proceso = proceso;
        sentencia.procesoId = proceso.id;

        if (user) {
          sentencia.created_by_name = user.name || "Sistema";
          sentencia.created_by_email = user.email || "sistema@simaud-lex.com";
          sentencia.create_uid = user;
        }
      }

      console.log("DEBUG: proceso.id =", proceso.id);
      console.log("DEBUG: sentencia.procesoId (before save) =", sentencia.procesoId);
      console.log("DEBUG: sentencia.proceso (id) =", sentencia.proceso?.id);
      
      console.log("Guardando sentencia...");
      let savedSentencia = await this.sentenciaRepository.save(sentencia);
      console.log("Sentencia guardada:", savedSentencia);

      // 2.1 ACTUALIZAR ESTADO DEL PROCESO A "SENTENCIA"
      console.log("Actualizando estado de proceso...");
      console.log("Actualizando estado de proceso...");
      // Use update to avoid relation cascade issues
      await this.procesoRepository.update(proceso.id, { estado: EstadoProceso.SENTENCIA });
      proceso.estado = EstadoProceso.SENTENCIA;
      console.log("Estado de proceso actualizado a SENTENCIA");

      // 3. PROCESAR RESULTADOS PARA RETORNO
      console.log("Procesando retorno...");
      let montoSugerido = 0;
      const razonamientos = resultadoMotor.resultadosAplicados.map((r: any) => {
        if (
          r.accion &&
          typeof r.accion === "object" &&
          r.accion.montoCalculado
        ) {
          montoSugerido = Number(r.accion.montoCalculado);
        }
        return r.fundamento;
      });

      const response = {
        procesoId: proceso.id,
        casoNumero: proceso.id_caso_dinamico || "SIN-NUMERO",
        hechosSimulacionId: hechosSimulacionSaved.id,
        puntuacionMadre: resultadoMotor.puntuacionMadre,
        puntuacionPadre: resultadoMotor.puntuacionPadre,
        recomendacionCustodia: resultadoMotor.recomendacionCustodia,
        casosSimilares: resultadoMotor.casosSimilares,
        cantidadCasosSimilares: resultadoMotor.cantidadCasosSimilares,
        simulacion: {
          montoSugerido:
            montoSugerido > 0
              ? montoSugerido
              : simulateDto.montoSolicitado || 0,
          moneda: "DOP",
          razonamiento:
            razonamientos.length > 0
              ? razonamientos
              : ["Se aplicaron criterios generales de derecho de familia."],
          datosConsiderados: {
            necesidadesNNA: [],
            recursosDemandado: simulateDto.recursosDemandadoEstimados,
            montoSolicitadoUsuario: simulateDto.montoSolicitado,
            notasUsuario: simulateDto.notasAdicionales,
          },
        },
        sentenciaFormal: sentencia.fallo,
        fechaSimulacion: hechosSimulacionSaved.fecha_simulacion,
      };

      console.log("Retornando respuesta exitosa.");
      return response;
    } catch (error) {
      console.error("❌ ERROR FATAL en generarSimulacionSentencia:", error);
      throw error;
    }
  }

  async getHistorialSimulaciones(
    procesoId: string
  ): Promise<HechosSimulacion[]> {
    // Verificar que el proceso existe
    await this.findOne(procesoId);

    // Obtener todas las simulaciones del proceso ordenadas por fecha (más recientes primero)
    return this.hechosSimulacionRepository.find({
      where: { proceso: { id: procesoId } },
      order: { fecha_simulacion: "DESC" },
      relations: [
        "casosSimilares",
        "casosSimilares.casoSimilar",
        "casosSimilares.casoSimilar.proceso",
      ],
    });
  }

  async getSimulacionById(simulacionId: string): Promise<HechosSimulacion> {
    const simulacion = await this.hechosSimulacionRepository.findOne({
      where: { id: simulacionId },
      relations: ["proceso", "proceso.nna"],
    });

    if (!simulacion) {
      throw new NotFoundException(
        `Simulación with ID ${simulacionId} not found`
      );
    }

    return simulacion;
  }

  async getCasosSimilaresBySimulacion(simulacionId: string): Promise<any[]> {
    // 1. Verificar si la simulación existe
    await this.getSimulacionById(simulacionId);

    // 2. Buscar casos similares asociados
    const similares = await this.casosSimilaresRepository.find({
      where: { casoActualId: simulacionId },
      relations: [
        "casoSimilar",
        "casoSimilar.proceso",
        "casoSimilar.proceso.nna",
      ],
      order: { scoreSimulitud: "DESC" },
    });

    // 3. Mapear a un formato amigable para el frontend
    return similares.map((similar) => ({
      casoId: similar.casoSimilar.id,
      procesoId: similar.casoSimilar.proceso?.id,
      scoreSimulitud: similar.scoreSimulitud,
      puntuacionMadre: similar.puntuacionMadreSimilar,
      puntuacionPadre: similar.puntuacionPadreSimilar,
      recomendacion: similar.recomendacionSimilar,
      camposCoincidentes: similar.camposCoincidentes,
      fechaSimulacion: similar.casoSimilar.fecha_simulacion,
    }));
  }

  async getAllRules(): Promise<any[]> {
    // Assuming Reglas repository is available via MotorInferenciaService or we can inject it here using module Ref
    // But better to check how MotorService accesses rules.
    // For now assuming we can simply return all rules via direct access if we inject the repo?
    // Let's check imports. We didn't inject ReglasRepo in this service.
    // We should probably rely on MotorInferenciaService to get rules or inject the repo.
    return this.motorInferenciaService.getAllReglas();
  }

  async shareCase(
    procesoId: string,
    recipientEmail: string,
    message?: string,
    senderUser?: any
  ): Promise<any> {
    // Verify the proceso exists
    const proceso = await this.findOne(procesoId);

    // Get the sentencia
    const sentencia = await this.sentenciaRepository.findOne({
      where: { proceso: { id: procesoId } },
    });

    if (!sentencia) {
      throw new NotFoundException(
        `No se encontró sentencia para el caso ${procesoId}`
      );
    }

    // TODO: Implement email sending service
    // For now, just log the information
    console.log("=== SHARING CASE ===");
    console.log(
      `From: ${senderUser?.email || "Sistema"} (${senderUser?.name || "Sistema"})`
    );
    console.log(`To: ${recipientEmail}`);
    console.log(`Case ID: ${proceso.id_caso_dinamico}`);
    console.log(`Message: ${message || "No message provided"}`);
    console.log(`Sentence: ${sentencia.fallo.substring(0, 100)}...`);
    console.log("==================");

    let mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: "davidceballo11@gmail.com", pass: "qzwl grnd fpxl qmbx" },
    });

    let mailDetails = {
      from: "davidceballo11@gmail.com",
      to: recipientEmail,
      subject: `📋 Caso Compartido - ${proceso.id_caso_dinamico}`,
      text: message || "Se ha compartido un caso judicial con usted.",
      html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Caso Compartido</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f2f5; padding: 20px 0;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <img src="https://cdn-icons-png.flaticon.com/512/3308/3308395.png" alt="SimAud-Lex Logo" style="width: 80px; height: 80px; margin-bottom: 20px; filter: brightness(0) invert(1);" />
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                    SimAud-Lex
                </h1>
                <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 400;">
                    Sistema de Simulación de Sentencias Judiciales
                </p>
            </td>
        </tr>
        
        <!-- Main Content -->
        <tr>
            <td style="padding: 40px 30px;">
                <div style="margin-bottom: 30px;">
                    <h2 style="margin: 0 0 15px 0; color: #1a202c; font-size: 24px; font-weight: 600;">
                        📋 Caso Compartido
                    </h2>
                    <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
                        Se ha compartido contigo un caso judicial. A continuación encontrarás los detalles:
                    </p>
                </div>

                ${
                  message
                    ? `
                <div style="background: linear-gradient(135deg, #f6f8fb 0%, #e9ecf3 100%); border-left: 4px solid #667eea; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
                    <p style="margin: 0; color: #2d3748; font-size: 14px; line-height: 1.6; font-style: italic;">
                        <strong style="color: #667eea;">💬 Mensaje:</strong><br/>
                        ${message}
                    </p>
                </div>
                `
                    : ""
                }

                <!-- Case Info Card -->
                <div style="background: #ffffff; border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                    <div style="margin-bottom: 20px;">
                        <p style="margin: 0 0 8px 0; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Número de Caso
                        </p>
                        <p style="margin: 0; color: #1a202c; font-size: 20px; font-weight: 700; font-family: 'Courier New', monospace;">
                            ${proceso.id_caso_dinamico}
                        </p>
                    </div>
                    
                    <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                        <p style="margin: 0 0 8px 0; color: #718096; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            ⚖️ Sentencia
                        </p>
                        <div style="background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 3px solid #764ba2;">
                            <p style="margin: 0; color: #2d3748; font-size: 14px; line-height: 1.6;">
                                ${sentencia.fallo.substring(0, 200)}${sentencia.fallo.length > 200 ? "..." : ""}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Call to Action -->
                <div style="text-align: center; margin: 35px 0;">
                    <a href="#" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                        🔍 Ver Caso Completo
                    </a>
                </div>

                <!-- Info Box -->
                <div style="background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin-top: 25px;">
                    <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                        <strong style="color: #b45309;">ℹ️ Nota:</strong> Este caso ha sido compartido desde el sistema SimAud-Lex. 
                        Para acceder al caso completo y toda la documentación asociada, inicia sesión en la plataforma.
                    </p>
                </div>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 10px 0; color: #4a5568; font-size: 13px;">
                    Compartido por: <strong>${senderUser?.name || "Sistema"}</strong>
                </p>
                <p style="margin: 0 0 20px 0; color: #718096; font-size: 12px;">
                    ${senderUser?.email || "sistema@simaud-lex.com"}
                </p>
                
                <div style="border-top: 1px solid #cbd5e0; padding-top: 20px; margin-top: 20px;">
                    <p style="margin: 0 0 5px 0; color: #2d3748; font-size: 13px; font-weight: 600;">
                        SimAud-Lex © ${new Date().getFullYear()}
                    </p>
                    <p style="margin: 0; color: #a0aec0; font-size: 11px;">
                        Sistema de Simulación de Audiencias y Sentencias Judiciales
                    </p>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`,
    };

    mailTransporter.sendMail(mailDetails, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent successfully");
      }
    });

    // Return success response
    return {
      success: true,
      message: `Caso compartido exitosamente con ${recipientEmail}`,
      caseId: proceso.id_caso_dinamico,
      sharedBy: senderUser?.email || "Sistema",
    };
  }
}
