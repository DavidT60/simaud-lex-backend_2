// motor-inferencia.service.ts

import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SimulateSentenciaDto } from "../proceso-judicial/dto/simulate-sentencia.dto";
import { Reglas } from "../proceso-judicial/reglas.entity";
import { RelacionReglasDTO } from "../proceso-judicial/relacion-reglas-dto.entity";

@Injectable()
export class MotorInferenciaService implements OnModuleInit {
  private reglas: Reglas[] = [];

  constructor(
    @InjectRepository(Reglas)
    private readonly reglasRepository: Repository<Reglas>,
    @InjectRepository(RelacionReglasDTO)
    private readonly relacionReglasRepository: Repository<RelacionReglasDTO>
  ) {}

  async cargarReglas() {
    this.reglas = await this.reglasRepository.find();
    console.log(`[MotorInferencia] ${this.reglas.length} reglas cargadas.`);
    console.log(this.reglas);
  }

  async onModuleInit() {
    await this.cargarReglas();
  }

  async procesarCaso(
    caso: SimulateSentenciaDto,
    nnaNombre?: string
  ): Promise<any> {
    console.log("Procesando caso:", caso);
    let resultadosAplicados: Array<{
      id: string;
      fundamento: string;
      accion: any;
      tipo: string;
      detallesEvaluacion?: any[];
    }> = [];

    // =========================================================
    // 1. RECORRER Y EVALUAR LAS REGLAS
    // =========================================================
    for (const regla of this.reglas) {
      // Logic of evaluation: Check relational fields
      console.log(`Evaluando regla ${regla.id}...`);
      const evaluacion = await this.evaluarCondicion(regla, caso);

      console.log(`Evaluación de regla ${regla.id}:`, evaluacion);
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
          detallesEvaluacion: evaluacion.detalle, // Guardamos los puntos/detalles
        });
      }
    }

    // 4. Integrar con el LLM (Paso Híbrido)
    return this.integrarConLLM(resultadosAplicados, caso, nnaNombre);
  }

  // =========================================================
  // MÉTODOS CLAVE PARA LA EJECUCIÓN DINÁMICA
  // =========================================================

  /**
   * Evaluates a rule based on associated DTO fields.
   */
  private async evaluarCondicion(
    regla: Reglas,
    caso: SimulateSentenciaDto
  ): Promise<{ esVerdadera: boolean; detalle: any[] }> {
    // 1. Find all field relationships for this rule
    const relaciones = await this.relacionReglasRepository.find({
      where: { regla: { id: regla.id } },
      relations: ["dtoField"],
    });

    console.log(
      `Evaluando regla ${regla.id} con ${relaciones.length} condiciones.`
    );

    if (relaciones.length === 0) {
      return { esVerdadera: false, detalle: [] };
    }

    const detalleEvaluacion: any[] = [];
    let reglaCumplida = true;

    // 2. Evaluate all conditions.
    // Assumption: ALL conditions must be met (AND logic)
    for (const rel of relaciones) {
      const fieldName = rel.dtoField.fieldName;
      const expectedValue = rel.value;
      const operator = rel.operator;

      const actualValue = caso[fieldName];

      let cumpleCondicion = false;
      let puntos = 0;

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

      if (cumpleCondicion) {
        puntos = 1; // Asigna un punto si cumple
      } else {
        reglaCumplida = false; // Si una falla, la regla entera falla (AND)
      }

      detalleEvaluacion.push({
        campo: rel.dtoField.label || fieldName,
        valorEsperado: expectedValue,
        valorActual: actualValue,
        cumple: cumpleCondicion,
        puntos: puntos,
        operador: operator,
      });
    }

    return { esVerdadera: reglaCumplida, detalle: detalleEvaluacion };
  }

  /**
   * Ejecuta las acciones específicas (cálculos, asignaciones).
   */
  private ejecutarAccion(accion: string, caso: SimulateSentenciaDto): any {
    // Lógica de cálculo compleja (solo se invoca si la regla se cumple)

    if (accion === "calcular_pension_sobre_ingresos") {
      // Ejemplo de cálculo de pensión (usando caso.nivel_de_ingresos)
      const monto = caso.nivel_de_ingresos * 0.3;
      return { montoCalculado: monto, tipo: "PORCENTAJE_INGRESO" };
    }

    if (accion === "estimar_pension_sobre_capacidad_productiva") {
      // Lógica compleja basada en el salario mínimo y jurisprudencia
      return { montoCalculado: 35000, tipo: "ESTIMACION_JURISPRUDENCIAL" };
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
    // Construir un prompt detallado basado en los resultados de la inferencia
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
    
    Contexto del Caso:
    - Nombre del NNA: ${nnaNombre || "No especificado"}
    - Edad del Menor: ${caso.edad_del_menor} años
    - Preferencia del Menor: ${caso.preferencia_del_menor}
    - Custodia Previa: ${caso.custodia_previa}
    - Ingresos del Demandado: ${caso.nivel_de_ingresos}
    
    
    Reglas y Fundamentos Jurídicos Aplicados por el Motor de Inferencia:
    ${reglasAplicadas}
    
    INSTRUCCIONES:
    Redacta el texto formal del "FALLO" de la sentencia.
    1. Usa lenguaje jurídico formal y respetuoso.
    2. Cita explícitamente los artículos y leyes mencionados en los fundamentos.
    3. Explica el razonamiento lógico que lleva a la decisión, basándote en los detalles de la evaluación (por ejemplo, si se cumplieron condiciones de idoneidad moral o económica).
    4. Determina claramente la pensión alimenticia y el régimen de custodia basándote en las acciones sugeridas.
    5. Sé conciso pero exhaustivo.
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
        const apiKey = process.env.GEMINI_API_KEY || "MY_API_KEY";
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

        return {
          sentenciaFormal: textoGenerado,
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

    return {
      sentenciaFormal: "Error desconocido tras reintentos.",
      resultadosTecnicos: resultados,
      error: "Max retries exceeded",
    };
  }
}
