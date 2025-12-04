import { Test, TestingModule } from '@nestjs/testing';
import { ProcesoJudicialController } from './proceso-judicial.controller';

describe('ProcesoJudicialController', () => {
  let controller: ProcesoJudicialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcesoJudicialController],
    }).compile();

    controller = module.get<ProcesoJudicialController>(ProcesoJudicialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
