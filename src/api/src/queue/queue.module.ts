import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { SecretsModule } from '../secrets/secrets.module';

@Module({
  imports: [SecretsModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}