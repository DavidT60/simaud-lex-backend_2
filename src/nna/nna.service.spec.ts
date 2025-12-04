import { Test, TestingModule } from '@nestjs/testing';
import { NnaService } from './nna.service';

describe('NnaService', () => {
  let service: NnaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NnaService],
    }).compile();

    service = module.get<NnaService>(NnaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
