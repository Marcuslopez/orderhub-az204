import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { SecretsService } from '../secrets/secrets.service';

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
    providers: [
      AuditService,
      {
        provide: SecretsService,
        useValue: {
          getSecret: jest.fn(),
        },
      },
    ]     
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
