import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CosmosClient, Container } from '@azure/cosmos';
import { SecretsService } from '../secrets/secrets.service';

type AuditEventInput = {
  orderId: string;
  type: string;
  userEmail?: string;
  data?: Record<string, any>;
};

@Injectable()
export class AuditService {
  private client?: CosmosClient;
  private container?: Container;

  constructor(private readonly secretsService: SecretsService) {}

  private async getContainer(): Promise<Container> {
    if (this.container) {
      return this.container;
    }

    try {
      const endpoint = await this.secretsService.getSecret(
        'cosmos-endpoint',
        'COSMOS-ENDPOINT',
      );

      const key = await this.secretsService.getSecret(
        'cosmos-key',
        'COSMOS-KEY',
      );

      const databaseId = await this.secretsService.getSecret(
        'cosmos-database-id',
        'COSMOS-DATABASE_ID',
      );

      const containerId = await this.secretsService.getSecret(
        'cosmos-container-id',
        'COSMOS-CONTAINER_ID',
      );

      this.client = new CosmosClient({
        endpoint,
        key,
      });

      const database = this.client.database(databaseId);
      this.container = database.container(containerId);

      return this.container;
    } catch (error) {
      console.error('Cosmos DB configuration error:', error);
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Error configuring Cosmos DB',
      );
    }
  }

  async recordEvent(event: AuditEventInput) {

    const container = await this.getContainer();

    const document = {
      id: `${event.type}-${event.orderId}-${Date.now()}`,
      orderId: event.orderId,
      type: event.type,
      userEmail: event.userEmail || 'system',
      data: event.data || {},
      createdAt: new Date().toISOString(),
    };

    await container.items.create(document);

    return document;
  }

  async findByOrderId(orderId: string) {
    const container = await this.getContainer();

    const query = {
      query:
        'SELECT * FROM c WHERE c.orderId = @orderId ORDER BY c.createdAt DESC',
      parameters: [
        {
          name: '@orderId',
          value: orderId,
        },
      ],
    };

    const { resources } = await container.items.query(query).fetchAll();

    return resources;
  }
}
