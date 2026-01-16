import { Test, TestingModule } from "@nestjs/testing";
import { MotorInferenciaService } from "./motor-inferencia.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Reglas } from "../proceso-judicial/reglas.entity";
import { RelacionReglasDTO } from "../proceso-judicial/relacion-reglas-dto.entity";
import { HechosSimulacion } from "../proceso-judicial/hechos-simulacion.entity";
import { CasosSimilares } from "../proceso-judicial/casos-similares.entity";

describe("MotorInferenciaService - Suitability", () => {
  let service: MotorInferenciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MotorInferenciaService,
        {
          provide: getRepositoryToken(Reglas),
          useValue: { find: jest.fn().mockResolvedValue([]) },
        },
        { provide: getRepositoryToken(RelacionReglasDTO), useValue: {} },
        {
          provide: getRepositoryToken(HechosSimulacion),
          useValue: { find: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: getRepositoryToken(CasosSimilares),
          useValue: { save: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MotorInferenciaService>(MotorInferenciaService);
  });

  it("should recommend TUTELA_LEGAL_TERCERO when both parents have very low scores", async () => {
    // Force the logic by mocking the internal state or flow
    // Since we can't easily inject the scores without running the rules loop,
    // we will spy on 'evaluarCondicion' to simulate negative points accumulation.

    // We mock the 'reglas' property to have 1 rule so the loop runs once
    (service as any).reglas = [{ id: "R1", action: "test", weight: 1 }];

    // Mock evaluarCondicion to return -20 points for both
    jest.spyOn(service as any, "evaluarCondicion").mockResolvedValue({
      esVerdadera: true,
      detalle: [],
      puntosMadre: -6,
      puntosPadre: -6,
    });

    // Mock internal methods to avoid side effects
    jest.spyOn(service as any, "ejecutarAccion").mockReturnValue({});
    jest.spyOn(service as any, "buscarCasosSimilares").mockResolvedValue([]);
    jest
      .spyOn(service as any, "integrarConLLM")
      .mockResolvedValue({ sentenciaFormal: "Test" });

    const result = await service.procesarCaso({} as any);

    expect(result.recomendacionCustodia).toBe("TUTELA_LEGAL_TERCERO");
    expect(result.puntuacionMadre).toBe(-6);
    expect(result.puntuacionPadre).toBe(-6);
  });
});
