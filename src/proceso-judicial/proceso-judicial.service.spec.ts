import { Test, TestingModule } from '@nestjs/testing';
import { ProcesoJudicialService } from './proceso-judicial.service';

describe('ProcesoJudicialService', () => {
  let service: ProcesoJudicialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcesoJudicialService],
    }).compile();

    service = module.get<ProcesoJudicialService>(ProcesoJudicialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
