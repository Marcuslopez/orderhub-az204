import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { SecretsModule } from '../secrets/secrets.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [SecretsModule, AuditModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}