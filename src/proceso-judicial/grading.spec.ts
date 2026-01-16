import { Test, TestingModule } from "@nestjs/testing";
import { ProcesoJudicialService } from "./proceso-judicial.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ProcesoJudicial } from "./proceso-judicial.entity";
import { EstadoProceso } from "./enums/proceso.enums";
import { CustomError } from "../common/exceptions/custom-exceptions.filter";
import { NotificationService } from "../notification/notification.service";
import { Nna } from "../nna/nna.entity";
import { HechosSimulacion } from "./hechos-simulacion.entity";
import { Sentencia } from "./sentencia.entity";
import { CasosSimilares } from "./casos-similares.entity";
import { MotorInferenciaService } from "../motor-inferencia/motor-inferencia.service";

describe("ProcesoJudicialService - Grading", () => {
  let service: ProcesoJudicialService;
  let repo: any;
  let notificationService: any;

  const mockProcesoRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockNotificationService = {
    create: jest.fn(),
  };

  const mockUser = {
    id: 1,
    role: "Profesor",
    email: "profesor@test.com",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcesoJudicialService,
        {
          provide: getRepositoryToken(ProcesoJudicial),
          useValue: mockProcesoRepository,
        },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: getRepositoryToken(Nna), useValue: {} },
        { provide: getRepositoryToken(HechosSimulacion), useValue: {} },
        {
          provide: getRepositoryToken(Sentencia),
          useValue: {
            findOne: jest.fn().mockResolvedValue({ fallo: "Test Fail" }),
          },
        },
        { provide: getRepositoryToken(CasosSimilares), useValue: {} },
        { provide: MotorInferenciaService, useValue: {} },
      ],
    }).compile();

    service = module.get<ProcesoJudicialService>(ProcesoJudicialService);
    repo = module.get(getRepositoryToken(ProcesoJudicial));
    notificationService = module.get(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("gradeCase", () => {
    it("should successfully grade a case in SENTENCIA status", async () => {
      const caseId = "uuid-123";
      const mockCase = {
        id: caseId,
        estado: EstadoProceso.SENTENCIA,
        id_caso_dinamico: "2024-001",
        create_uid: { id: 2, email: "student@test.com" },
        is_calificacion: false,
      };

      repo.findOne.mockResolvedValue(mockCase);
      repo.save.mockResolvedValue({ ...mockCase, calificacion: 95 });

      jest
        .spyOn(service, "shareCase")
        .mockResolvedValue({ success: true } as any);
      await service.gradeCase(caseId, 95, "Great work", mockUser);

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          calificacion: 95,
          detallesCalificacion: "Great work",
          calificadoPor: mockUser,
          is_calificacion: true,
        })
      );
      expect(notificationService.create).toHaveBeenCalled();
    });

    it("should throw error if case is not in SENTENCIA status", async () => {
      const mockCase = {
        id: "uuid-123",
        estado: EstadoProceso.EN_PROCESO,
        is_calificacion: false,
      };

      repo.findOne.mockResolvedValue(mockCase);

      await expect(
        service.gradeCase("uuid-123", 90, "Details", mockUser)
      ).rejects.toThrow(CustomError);
    });

    it("should throw error if user is not authorized", async () => {
      const studentUser = { role: "Estudiante" };
      await expect(
        service.gradeCase("uuid-123", 90, "Details", studentUser)
      ).rejects.toThrow(CustomError);
    });

    it("should throw error if case is already graded", async () => {
      const mockCase = {
        id: "uuid-123",
        estado: EstadoProceso.SENTENCIA,
        is_calificacion: true,
      };

      repo.findOne.mockResolvedValue(mockCase);
      await expect(
        service.gradeCase("uuid-123", 90, "Details", mockUser)
      ).rejects.toThrow(
        "Este caso ya ha sido calificado y no se puede editar."
      );
    });
  });
});
