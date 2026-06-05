import { Injectable } from '@nestjs/common';
import { QueueClient } from '@azure/storage-queue';
import { SecretsService } from '../secrets/secrets.service';

@Injectable()
export class QueueService {
  constructor(private readonly secretsService: SecretsService) {}

  async sendOrderCreated(orderId: number) {
    const connectionString = await this.secretsService.getSecret(
      'azure-storage-connection-string',
    );

    const queueName = await this.secretsService.getSecret(
      'QUEUE-NAME',
    );

    const client = new QueueClient(connectionString, queueName);

    await client.createIfNotExists();

    const message = Buffer.from(
      JSON.stringify({ orderId }),
    ).toString('base64');

    await client.sendMessage(message);
  }
}