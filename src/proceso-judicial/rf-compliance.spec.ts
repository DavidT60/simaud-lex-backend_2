import { Test, TestingModule } from '@nestjs/testing';
import { ProcesoJudicialService } from './proceso-judicial.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProcesoJudicial } from './proceso-judicial.entity';
import { Nna } from '../nna/nna.entity';
import { HechosSimulacion } from './hechos-simulacion.entity';
import { Sentencia } from './sentencia.entity';
import { CasosSimilares } from './casos-similares.entity';
import { MotorInferenciaService } from '../motor-inferencia/motor-inferencia.service';
import { NotificationService } from '../notification/notification.service';
import { EstadoProceso } from './enums/proceso.enums';
import { SimulateSentenciaDto } from './dto/simulate-sentencia.dto';
import { NotFoundException } from '@nestjs/common';
import { CustomError } from '../common/exceptions/custom-exceptions.filter';

describe('System RF Compliance (End-to-End Simulation)', () => {
  let service: ProcesoJudicialService;
  let motorService: MotorInferenciaService;
  let repoProceso: any;
  let repoNna: any;

  // Mock Data
  const mockUser = { id: 1, email: 'profesor@test.com', role: 'Profesor', name: 'Profesor X' };
  const mockStudent = { id: 2, email: 'student@test.com', role: 'Estudiante', name: 'Student Y' };
  const mockNna = { id: 'nna-1', nombre_completo: 'Juan Perez', edad: 10 };
  const mockProceso = { 
    id: 'case-1', 
    nna: mockNna, 
    estado: EstadoProceso.EN_PROCESO, 
    create_uid: mockUser 
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcesoJudicialService,
        {
          provide: getRepositoryToken(ProcesoJudicial),
          useValue: {
            create: jest.fn().mockReturnValue(mockProceso),
            save: jest.fn().mockResolvedValue(mockProceso),
            findOne: jest.fn().mockResolvedValue(mockProceso),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Nna),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockNna),
          },
        },
        {
          provide: getRepositoryToken(HechosSimulacion),
          useValue: {
            create: jest.fn().mockReturnValue({ id: 'hechos-1' }),
            save: jest.fn().mockResolvedValue({ id: 'hechos-1', fecha_simulacion: new Date() }),
          },
        },
        {
          provide: getRepositoryToken(Sentencia),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation((entity) => entity),
          },
        },
        {
          provide: getRepositoryToken(CasosSimilares),
          useValue: {},
        },
        {
          provide: MotorInferenciaService,
          useValue: {
            procesarCaso: jest.fn().mockResolvedValue({
              puntuacionMadre: 80,
              puntuacionPadre: 60,
              recomendacionCustodia: 'MADRE',
              resultadosAplicados: [{ fundamento: 'Art. 1', accion: { montoCalculado: 5000 } }],
              casosSimilares: [],
              sentenciaFormal: 'FALLA: OTORGA GUARDA A MADRE',
            }),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProcesoJudicialService>(ProcesoJudicialService);
    motorService = module.get<MotorInferenciaService>(MotorInferenciaService);
    repoProceso = module.get(getRepositoryToken(ProcesoJudicial));
    repoNna = module.get(getRepositoryToken(Nna));
  });

  describe('RF1: Registro de caso simulado', () => {
    it('should create a case with NNA and tracking info', async () => {
      const createDto = { nnaId: 'nna-1', descripcion: 'Test Case' };
      const result = await service.create(createDto as any, mockUser);
      
      expect(repoNna.findOne).toHaveBeenCalledWith({ where: { id: 'nna-1' } });
      expect(repoProceso.create).toHaveBeenCalledWith(expect.objectContaining({
        nna: mockNna,
        create_uid: mockUser
      }));
      expect(result).toBeDefined();
    });

    it('should throw error if NNA not found', async () => {
      repoNna.findOne.mockResolvedValue(null);
      await expect(service.create({ nnaId: 'bad-id' } as any, mockUser))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('RF2 & RF3: Simulación de flujo y Aplicación de reglas', () => {
    it('should run simulation, apply rules, and generate sentence', async () => {
      const simulateDto: SimulateSentenciaDto = {
        montoSolicitado: 10000,
        // ... other fields
      } as any;

      const result = await service.generarSimulacionSentencia('case-1', simulateDto, mockUser);

      // Verify RF3: Motor Inferencia called
      // The service gets NNA name from the process object (proceso.nna.nombre_completo)
      expect(motorService.procesarCaso).toHaveBeenCalledWith(simulateDto, 'Juan Perez', 'hechos-1');
      
      // Verify RF6: Sentence Generation logic
      expect(result.recomendacionCustodia).toBe('MADRE');
      expect(result.sentenciaFormal).toContain('FALLA:');
      
      // Verify state update (RF2 flow)
      expect(repoProceso.update).toHaveBeenCalledWith('case-1', { estado: EstadoProceso.SENTENCIA });
    });
  });

  describe('RF8: Roles y Perfiles', () => {
    it('should restrict grading to Admins/Professors', async () => {
        // Mock unauthorized user
        const unauthorizedUser = { role: 'Estudiante' };
        
        await expect(service.gradeCase('case-1', 90, 'Good', unauthorizedUser))
          .rejects.toThrow(CustomError);
    });

    it('should allow grading for Professors', async () => {
        // Mock authorized case state
        repoProceso.findOne.mockResolvedValue({ 
            ...mockProceso, 
            estado: EstadoProceso.SENTENCIA, 
            create_uid: mockStudent 
        });

        // Spy on shareCase to avoid email error
        jest.spyOn(service, 'shareCase').mockResolvedValue(true);

        await service.gradeCase('case-1', 90, 'Good job', mockUser);
        expect(repoProceso.save).toHaveBeenCalled();
    });
  });
});
