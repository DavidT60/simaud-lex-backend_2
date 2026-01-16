// motor-inferencia.service.ts

import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not } from "typeorm";
import { SimulateSentenciaDto } from "../proceso-judicial/dto/simulate-sentencia.dto";
import { Reglas } from "../proceso-judicial/reglas.entity";
import { RelacionReglasDTO } from "../proceso-judicial/relacion-reglas-dto.entity";
import { HechosSimulacion } from "../proceso-judicial/hechos-simulacion.entity";
import { CasosSimilares } from "../proceso-judicial/casos-similares.entity";
// env
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MotorInferenciaService implements OnModuleInit {
  private reglas: Reglas[] = [];

  constructor(
    @InjectRepository(Reglas)
    private readonly reglasRepository: Repository<Reglas>,
    @InjectRepository(RelacionReglasDTO)
    private readonly relacionReglasRepository: Repository<RelacionReglasDTO>,
    @InjectRepository(HechosSimulacion)
    private readonly hechosSimulacionRepository: Repository<HechosSimulacion>,
    @InjectRepository(CasosSimilares)
    private readonly casosSimilaresRepository: Repository<CasosSimilares>
  ) {}

  // reload all the rules
  async cargarReglas() {
    this.reglas = await this.reglasRepository.find();
    console.log(`[MotorInferencia] ${this.reglas.length} reglas cargadas.`);
    console.log(this.reglas);
    console.log("DATABASE_URL: ", String(process.env.DATABASE_URL));
    console.log("GEMINI_API_KEY: ", String(process.env.GEMINI_API_KEY));
  }

  // internal method execute when the calss Instance is created
  async onModuleInit() {
    await this.cargarReglas();
  }

  getAllReglas(): Reglas[] {
    return this.reglas;
  }

  // recive all the information required from the form
  async procesarCaso(
    caso: SimulateSentenciaDto,
    nnaNombre?: string,
    casoId?: string
  ): Promise<any> {
    console.log("Procesando caso:", caso);

    let resultadosAplicados: Array<{
      id: string;
      fundamento: string;
      accion: any;
      tipo: string;
      detallesEvaluacion?: any[];
      puntosMadre?: number;
      puntosPadre?: number;
    }> = [];

    // Acumuladores de puntuación
    let totalPuntosMadre = 0;
    let totalPuntosPadre = 0;

    // =========================================================
    // 1. RECORRER Y EVALUAR LAS REGLAS
    // =========================================================
    for (const regla of this.reglas) {
      console.log(`Evaluando regla ${regla.id}...`);
      const evaluacion = await this.evaluarCondicion(regla, caso);

      console.log(`Evaluación de regla ${regla.id}:`, evaluacion);

      // Acumular puntos
      totalPuntosMadre += evaluacion.puntosMadre;
      totalPuntosPadre += evaluacion.puntosPadre;

      if (evaluacion.esVerdadera) {
        // 2. Ejecutar la acción
        const accion = this.ejecutarAccion(regla.action, caso);

        // 3. Registrar el Fundamento y la Acción
        resultadosAplicados.push({
          id: regla.id,
          fundamento: regla.legal_basis,
          accion: accion,
          tipo: regla.action.includes("custodia")
            ? "GUARDA"
            : regla.action.includes("pension")
              ? "ALIMENTOS"
              : "PROCESAL",
          detallesEvaluacion: evaluacion.detalle,
          puntosMadre: evaluacion.puntosMadre,
          puntosPadre: evaluacion.puntosPadre,
        });
      }
    }

    // Calcular recomendación de custodia basada en puntuación
    const diferencia = totalPuntosMadre - totalPuntosPadre;
    const margen = 3; // Diferencia mínima para custodia exclusiva
    
    // UMBRAL MINIMO DE IDONEIDAD
    // Si ambos padres tienen una puntuación muy negativa, ninguno es apto.
    const UMBRAL_IDONEIDAD = -5;

    let recomendacionCustodia: "MADRE" | "PADRE" | "COMPARTIDA" | "TUTELA_LEGAL_TERCERO";
    
    if (totalPuntosMadre < UMBRAL_IDONEIDAD && totalPuntosPadre < UMBRAL_IDONEIDAD) {
      console.log(`⚠️ ALERTA: Ambos padres por debajo del umbral (${UMBRAL_IDONEIDAD}). Se sugiere Tercero.`);
      recomendacionCustodia = "TUTELA_LEGAL_TERCERO";
    } else if (Math.abs(diferencia) < margen) {
      recomendacionCustodia = "COMPARTIDA";
    } else if (diferencia > 0) {
      recomendacionCustodia = "MADRE";
    } else {
      recomendacionCustodia = "PADRE";
    }

    // 4. Buscar casos similares
    console.log("🔍 Buscando casos similares...");
    const casosSimilares = await this.buscarCasosSimilares(caso, casoId);

    // 5. Enriquecer con información de precedentes y guardar relaciones
    const casosSimilaresEnriquecidos = casosSimilares.map((similar) => ({
      casoId: similar.caso.id,
      procesoId: similar.caso.proceso?.id,
      numeroCaso: similar.caso.proceso?.id_caso_dinamico || "N/A",
      tipoDemanda: similar.caso.proceso?.tipo_demanda || "N/A",
      scoreSimulitud: similar.score,
      puntuacionMadre: similar.caso.puntuacion_madre || null,
      puntuacionPadre: similar.caso.puntuacion_padre || null,
      recomendacion: similar.caso.recomendacion_custodia || null,
      camposCoincidentes: similar.camposCoincidentes,
      fechaSimulacion: similar.caso.fecha_simulacion,
    }));

    // 6. Guardar casos similares en la BD si tenemos el casoId
    if (casoId && casosSimilares.length > 0) {
      console.log(
        `💾 Guardando ${casosSimilares.length} casos similares para caso ${casoId}...`
      );
      await this.guardarCasosSimilares(casoId, casosSimilaresEnriquecidos);
    }
    console.log(
      "Retornando resultados con casos similares:",
      JSON.stringify(casosSimilaresEnriquecidos, null, 2)
    );
    // 7. Retornar resultados con puntuación y casos similares
    let hibrido_resultado = {
      resultadosAplicados,
      puntuacionMadre: totalPuntosMadre,
      puntuacionPadre: totalPuntosPadre,
      recomendacionCustodia,
      casosSimilares: casosSimilaresEnriquecidos,
      cantidadCasosSimilares: casosSimilares.length,
      sentenciaFormal: null as string | null,
    };

    // console.log(" Hibrido resultado: ", JSON.stringify(hibrido_resultado, null, 2));
    console.log("resultadosAplicados: ", JSON.stringify(resultadosAplicados, null, 2));
    
    // call llm with rule results
    const llmResult = await this.integrarConLLM(resultadosAplicados, caso, nnaNombre);
    
    // Merge LLM result into the return object
    hibrido_resultado = {
      ...hibrido_resultado,
      sentenciaFormal: llmResult.sentenciaFormal
    };

    return hibrido_resultado;
  }

  // =========================================================
  // MÉTODOS CLAVE PARA LA EJECUCIÓN DINÁMICA
  // =========================================================

  /**
   * Evaluates a rule based on associated DTO fields.
   * Now includes parent scoring system with weighted points.
   */
  private async evaluarCondicion(
    regla: Reglas,
    caso: SimulateSentenciaDto
  ): Promise<{
    esVerdadera: boolean;
    detalle: any[];
    puntosMadre: number;
    puntosPadre: number;
  }> {
    // Lista de campos negativos (que restan puntos cuando son TRUE)
    const CAMPOS_NEGATIVOS = [
      "_antecedentes_de_violencia",
      "_evidencia_negligencia_severa",
      "_conducta_agresiva_anterior",
      "_reportes_psicosociales_negativos",
      "_sin_ingresos_formales",
      "_incumple_pension",
    ];

    // 1. Find all field relationships for this rule
    const relaciones = await this.relacionReglasRepository.find({
      where: { regla: { id: regla.id } },
      relations: ["dtoField"],
    });

    console.log(
      `Evaluando regla ${regla.id} (peso: ${regla.peso}) con ${relaciones.length} condiciones.`
    );

    if (relaciones.length === 0) {
      console.log(`⚠️ Regla ${regla.id} no tiene relaciones definidas`);
      return {
        esVerdadera: false,
        detalle: [],
        puntosMadre: 0,
        puntosPadre: 0,
      };
    }

    const detalleEvaluacion: any[] = [];
    let reglaCumplida = true;
    let puntosMadre = 0;
    let puntosPadre = 0;

    // 2. Evaluate all conditions
    for (const rel of relaciones) {
      const fieldName = rel.dtoField.fieldName;
      const expectedValue = rel.value;
      const operator = rel.operator;
      const actualValue = caso[fieldName];

      console.log(`  📋 Campo: ${fieldName}`);
      console.log(`     Esperado: ${expectedValue} (${operator})`);
      console.log(`     Actual: ${actualValue} (tipo: ${typeof actualValue})`);

      let cumpleCondicion = false;

      // Detectar progenitor del campo
      let progenitor: "MADRE" | "PADRE" | "NINGUNO" = "NINGUNO";
      if (fieldName.startsWith("madre_")) {
        progenitor = "MADRE";
      } else if (fieldName.startsWith("padre_")) {
        progenitor = "PADRE";
      }

      console.log(`Progenitor detectado: ${progenitor}`);

      // Detectar si es campo negativo (resta puntos)
      const esNegativo = CAMPOS_NEGATIVOS.some((neg) =>
        fieldName.includes(neg)
      );
      const signo = esNegativo ? -1 : 1;

      // Basic evaluation logic
      if (typeof actualValue === "boolean") {
        const expectedBool = expectedValue === "true" || expectedValue === "1";

        if (rel.value !== null && rel.value !== undefined) {
          cumpleCondicion = actualValue === expectedBool;
        } else {
          cumpleCondicion = !!actualValue;
        }
      } else if (typeof actualValue === "number") {
        // Number comparison
        if (operator === "GREATER_THAN") {
          cumpleCondicion = actualValue > Number(expectedValue);
        } else if (operator === "LESS_THAN") {
          cumpleCondicion = actualValue < Number(expectedValue);
        } else {
          // Equality
          cumpleCondicion = actualValue === Number(expectedValue);
        }
      } else {
        // String comparison
        cumpleCondicion = !!(rel.value && actualValue === rel.value);
      }

      // Asignar puntos según progenitor y cumplimiento
      if (cumpleCondicion && progenitor !== "NINGUNO") {
        const puntos = regla.peso * signo;

        if (progenitor === "MADRE") {
          puntosMadre += puntos;
          console.log(`     ✅ MADRE +${puntos} puntos`);
        } else if (progenitor === "PADRE") {
          puntosPadre += puntos;
          console.log(`     ✅ PADRE +${puntos} puntos`);
        }
      } else {
        console.log(
          `     ❌ No asigna puntos (cumple: ${cumpleCondicion}, progenitor: ${progenitor})`
        );
      }

      if (!cumpleCondicion) {
        reglaCumplida = false; // Si una falla, la regla entera falla (AND)
      }

      detalleEvaluacion.push({
        campo: rel.dtoField.label || fieldName,
        valorEsperado: expectedValue,
        valorActual: actualValue,
        cumple: cumpleCondicion,
        progenitor: progenitor,
        signo: signo,
        puntosAsignados:
          cumpleCondicion && progenitor !== "NINGUNO" ? regla.peso * signo : 0,
        operador: operator,
      });
    }

    return {
      esVerdadera: reglaCumplida,
      detalle: detalleEvaluacion,
      puntosMadre,
      puntosPadre,
    };
  }

  /**
   * Ejecuta las acciones específicas (cálculos, asignaciones).
   */
  private ejecutarAccion(accion: string, caso: SimulateSentenciaDto): any {
    // Lógica de cálculo compleja (solo se invoca si la regla se cumple)
    console.log(`Ejecutando acción: ${accion}`);
    if (accion === "calcular_pension_sobre_ingresos") {
      // Ejemplo de cálculo de pensión (usando caso.nivel_de_ingresos)
      const monto = (caso.nivel_de_ingresos ?? 0) * 0.3;
      return { montoCalculado: monto, tipo: "PORCENTAJE_INGRESO" };
    }

    if (accion === "estimar_pension_sobre_capacidad_productiva") {
      // Lógica compleja basada en el salario mínimo y jurisprudencia
      return { montoCalculado: 35000, tipo: "ESTIMACION_JURISPRUDENCIAL" };
    }

    if (accion === "considerar_preferencia_menor") {
      // menor preferencia
      return { preferencia: caso.preferencia_del_menor };
    }

    // Acciones simples (asignación de texto)
    return { resultado: accion };
  }

  /**
   * Envía los resultados y el contexto a la IA para generar el texto de la Sentencia.
   */
  /*
   * Envía los resultados y el contexto a la IA para generar el texto de la Sentencia.
   */
  /*
   * Envía los resultados y el contexto a la IA para generar el texto de la Sentencia.
   * Implementa reintentos con backoff exponencial.
   */
  private async integrarConLLM(
    resultados: any[],
    caso: SimulateSentenciaDto,
    nnaNombre?: string
  ) {
    console.log("Sending LLM PP")
    // Construir un prompt detallado basado en los resultados de la inferencia
    console.log("resultados: ", JSON.stringify(resultados, null, 2));
    const reglasAplicadas = resultados
      .map(
        (r) =>
          `- Regla: ${r.id}
       - Fundamento: ${r.fundamento}
       - Acción: ${JSON.stringify(r.accion)}
       - Evaluación Detallada: ${JSON.stringify(r.detallesEvaluacion)}`
      )
      .join("\n");

    const prompt = `
    Actúa como un Juez de Familia Experto en la República Dominicana.

    Reglas y Fundamentos Jurídicos Aplicados por el Motor de Inferencia (Base de Datos):
    ${reglasAplicadas}
    ${JSON.stringify(resultados, null, 2)}

    INSTRUCCIONES:
    Redacta EXCLUSIVAMENTE el texto formal del "FALLO" final de la sentencia.
    NO incluyas introducciones largas ni explicaciones innecesarias fuera del fallo.
    
    El fallo debe contener:
    1. La decisión sobre la Guarda y Custodia (Madre, Padre o Compartida) basada en las reglas aplicadas.
    2. El monto exacto de la pensión alimenticia a pagar, si aplica.
    3. Un régimen de visitas claro y detallado.
    4. Citas breves de los artículos legales clave (Ley 136-03).

    Formato esperado:
    "FALLA:
    PRIMERO: OTORGA la guarda y custodia a favor de...
    SEGUNDO: FIJA una pensión alimenticia de...
    TERCERO: ESTABLECE el siguiente régimen de visitas..."
    `;

    console.log("Prompt para LLM:", prompt);

    const maxRetries = 3;
    let attempt = 0;
    let delay = 2000; // Inicia con 2 segundos

    // Función auxiliar para esperar
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    while (attempt < maxRetries) {
      try {
        const apiKey = String(process.env.GEMINI_API_KEY);
        if (!apiKey) {
          throw new Error("GEMINI_API_KEY not found in environment variables");
        }

        const url =
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
          apiKey;

        const payload = {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        };

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        // Si es 429 (Resource Exhausted), manejamos el reintento
        if (response.status === 429) {
          attempt++;
          console.warn(
            `[GEMINI] Rate limit (429) excedido. Intento ${attempt}/${maxRetries}. Esperando ${delay}ms...`
          );

          if (attempt >= maxRetries) {
            const errorText = await response.text();
            throw new Error(
              `Gemini Rate Limit Exhausted after ${maxRetries} attempts: ${errorText}`
            );
          }

          await sleep(delay);
          delay *= 2; // Exponential backoff (2s -> 4s -> 8s)
          continue; // Reintentar
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Gemini API Error: ${response.status} - ${errorText}`
          );
        }

        const data = await response.json();
        const textoGenerado =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No se pudo generar el texto.";

        console.log("Texto generado:", textoGenerado);

        return {
          sentenciaFormal: textoGenerado + "\n (Resultado LLM)",
          resultadosTecnicos: resultados,
          promptUtilizado: prompt,
        };
      } catch (error) {
        console.error(`Error en intento ${attempt + 1}:`, error.message);

        // Si no es un error de rate limit (que ya manejamos arriba con continue), salimos o reintentamos según lógica
        // En este caso, si es un error fatal (como API Key missing), no tiene sentido reintentar.
        if (
          attempt >= maxRetries - 1 ||
          error.message.includes("GEMINI_API_KEY")
        ) {
          return {
            sentenciaFormal:
              "Error en IA: " + (error.message || "Error desconocido"),
            resultadosTecnicos: resultados,
            error: error.message,
          };
        }
        // Si es otro tipo de error de red, podríamos querer reintentar también...
        attempt++;
        await sleep(delay);
        delay *= 2;
      }
    }
    console.log("Resultados tecnicos: ", resultados);
    return {
      sentenciaFormal: "Error desconocido tras reintentos.",
      resultadosTecnicos: resultados,
      error: "Max retries exceeded",
    };
  }
  /**
   * Calcula la similitud entre dos casos usando pesos por categoría
   */
  private calcularSimilitud(
    casoActual: SimulateSentenciaDto | HechosSimulacion,
    casoComparar: HechosSimulacion
  ): { score: number; camposCoincidentes: any[] } {
    const PESOS_CATEGORIAS = {
      VIOLENCIA: 0.3, // 30%
      NEGLIGENCIA: 0.25, // 25%
      ESTABILIDAD: 0.2, // 20%
      INGRESOS: 0.15, // 15%
      NECESIDADES_ESPECIALES: 0.1, // 10%
    };

    const CAMPOS_POR_CATEGORIA = {
      VIOLENCIA: [
        "madre_tiene_antecedentes_de_violencia",
        "padre_tiene_antecedentes_de_violencia",
        "madre_conducta_agresiva_anterior",
        "padre_conducta_agresiva_anterior",
      ],
      NEGLIGENCIA: [
        "madre_evidencia_negligencia_severa",
        "padre_evidencia_negligencia_severa",
        "madre_reportes_psicosociales_negativos",
        "padre_reportes_psicosociales_negativos",
      ],
      ESTABILIDAD: [
        "madre_demuestra_estabilidad_emocional",
        "padre_demuestra_estabilidad_emocional",
        "estado_emocional_madre",
        "estado_emocional_padre",
        "idoneidad_moral_madre",
        "idoneidad_moral_padre",
      ],
      INGRESOS: [
        "madre_tiene_ingresos_comprobados",
        "padre_tiene_ingresos_comprobados",
        "nivel_de_ingresos_madre",
        "nivel_de_ingresos_padre",
        "estabilidad_laboral_madre",
        "estabilidad_laboral_padre",
      ],
      NECESIDADES_ESPECIALES: [
        "menor_tiene_necesidades_especiales",
        "madre_maneja_necesidades_especiales",
        "padre_maneja_necesidades_especiales",
      ],
    };

    let scoreTotal = 0;
    const camposCoincidentes: any[] = [];

    // Evaluar cada categoría
    for (const [categoria, peso] of Object.entries(PESOS_CATEGORIAS)) {
      const campos = CAMPOS_POR_CATEGORIA[categoria];
      let coincidencias = 0;
      let totalCampos = campos.length;

      for (const campo of campos) {
        const valorActual = casoActual[campo];
        const valorComparar = casoComparar[campo];

        // Comparación según tipo
        let coincide = false;
        if (
          typeof valorActual === "boolean" &&
          typeof valorComparar === "boolean"
        ) {
          coincide = valorActual === valorComparar;
        } else if (
          typeof valorActual === "number" &&
          typeof valorComparar === "number"
        ) {
          // Para números, considerar similitud si están dentro del 20%
          const diferencia = Math.abs(valorActual - valorComparar);
          const promedio = (valorActual + valorComparar) / 2;
          coincide =
            promedio > 0 ? diferencia / promedio < 0.2 : diferencia < 1000;
        } else if (
          typeof valorActual === "string" &&
          typeof valorComparar === "string"
        ) {
          coincide = valorActual === valorComparar;
        } else if (valorActual === undefined || valorComparar === undefined) {
          // Si uno es undefined, lo ignoramos en el cálculo
          totalCampos--;
          continue;
        }

        if (coincide) {
          coincidencias++;
          camposCoincidentes.push({
            campo,
            categoria,
            peso: peso / totalCampos,
            coincide: true,
          });
        }
      }

      // Calcular score de esta categoría
      if (totalCampos > 0) {
        const scoreCategoria = (coincidencias / totalCampos) * peso * 100;
        scoreTotal += scoreCategoria;
      }
    }

    return { score: scoreTotal, camposCoincidentes };
  }

  /**
   * Busca casos similares en la base de datos
   */
  private async buscarCasosSimilares(
    casoActual: SimulateSentenciaDto,
    casoActualId?: string
  ): Promise<any[]> {
    const THRESHOLD_SIMILITUD = 70; // 70% umbral para encontrar más coincidencias
    const MAX_CASOS_SIMILARES = 5;

    // Obtener todos los casos históricos (excepto el actual)
    const casosHistoricos = await this.hechosSimulacionRepository.find({
      where: casoActualId ? { id: Not(casoActualId) as any } : {},
      relations: ["proceso"],
      take: 100, // Aumentamos el histórico a comparar
      order: { fecha_simulacion: "DESC" },
    });

    console.log(
      `🔍 Buscando casos similares entre ${casosHistoricos.length} casos históricos...`
    );

    const resultados: any[] = [];

    for (const casoHistorico of casosHistoricos) {
      const { score, camposCoincidentes } = this.calcularSimilitud(
        casoActual,
        casoHistorico
      );

      if (score >= THRESHOLD_SIMILITUD) {
        resultados.push({
          caso: casoHistorico,
          score,
          camposCoincidentes,
        });
      }
    }

    // Ordenar por score descendente y tomar los mejores
    resultados.sort((a, b) => b.score - a.score);
    const mejoresCasos = resultados.slice(0, MAX_CASOS_SIMILARES);

    console.log(
      `✅ Encontrados ${mejoresCasos.length} casos similares (>=${THRESHOLD_SIMILITUD}%)`
    );

    return mejoresCasos;
  }

  /**
   * Guarda las relaciones de casos similares en la BD
   */
  private async guardarCasosSimilares(
    casoActualId: string,
    casosSimilares: any[]
  ): Promise<void> {
    for (const similar of casosSimilares) {
      try {
        const casoSimilarEntity = this.casosSimilaresRepository.create({
          casoActual: { id: casoActualId } as any,
          casoSimilar: { id: similar.casoId } as any,
          scoreSimulitud: similar.scoreSimulitud,
          camposCoincidentes: similar.camposCoincidentes,
          puntuacionMadreSimilar: similar.puntuacionMadre,
          puntuacionPadreSimilar: similar.puntuacionPadre,
          recomendacionSimilar: similar.recomendacion,
        });

        let saved_similar =
          await this.casosSimilaresRepository.save(casoSimilarEntity);
        console.log(`💾 Guardado caso similar ${saved_similar.id}`);
      } catch (error) {
        console.error(
          `❌ Error al guardar caso similar (ID: ${similar.casoId}):`,
          error
        );
        // No relanzamos el error para permitir que el proceso continúe
      }
    }

    console.log(`💾 Guardados ${casosSimilares.length} casos similares`);
  }
}
