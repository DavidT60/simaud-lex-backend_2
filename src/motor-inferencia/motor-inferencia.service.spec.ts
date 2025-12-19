// motor-inferencia.service.spec.ts

import { Test, TestingModule } from "@nestjs/testing";
import { MotorInferenciaService } from "./motor-inferencia.service";

describe("MotorInferenciaService", () => {
  let service: MotorInferenciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MotorInferenciaService],
    }).compile();

    service = module.get<MotorInferenciaService>(MotorInferenciaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
