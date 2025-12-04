import { Test, TestingModule } from '@nestjs/testing';
import { NnaController } from './nna.controller';

describe('NnaController', () => {
  let controller: NnaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NnaController],
    }).compile();

    controller = module.get<NnaController>(NnaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
