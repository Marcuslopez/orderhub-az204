import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { SecretsService } from '../secrets/secrets.service';
import { AuditService } from '../audit/audit.service';

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: SecretsService,
          useValue: {
            getSecret: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: {
            log: jest.fn(),
          },
        },
      ]      
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
