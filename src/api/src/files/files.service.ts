import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  BlobServiceClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { SecretsService } from '../secrets/secrets.service';
import 'multer';
import { AuditService } from '../audit/audit.service';


@Injectable()
export class FilesService {
  constructor(private readonly secretsService: SecretsService,     
  private readonly auditService: AuditService, 
  ) {}

  private async getStorageConfig() {
    const connectionString = await this.secretsService.getSecret(
      'azure-storage-connection-string',
      'AZURE_STORAGE_CONNECTION_STRING',
    );

    const containerName = await this.secretsService.getSecret(
      'azure-storage-container-name',
      'AZURE_STORAGE_CONTAINER_NAME',
    );

    return {
      connectionString,
      containerName,
    };
  }

    async uploadFile(file: Express.Multer.File,orderId?: string,user?: any,) {
    const { connectionString, containerName } = await this.getStorageConfig();

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);

    const containerClient = blobServiceClient.getContainerClient(containerName);

    await containerClient.createIfNotExists();

    const safeOrderId = orderId || 'unassigned';

    const cleanFileName = file.originalname.replace(/\s+/g, '-');
    const blobName = `${safeOrderId}/${safeOrderId}-${Date.now()}-${cleanFileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const auditOrderId = safeOrderId.replace('order-', '').replace(/^0+/, '');

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });

await this.auditService.recordEvent({
  orderId: String(auditOrderId),
  type: 'FILE_UPLOADED',
  userEmail: user?.email,
  data: {
    fileName: file.originalname,
    blobName,
    contentType: file.mimetype,
    size: file.size,
  },
});

    return {
      orderId: safeOrderId,
      fileName: blobName.split('/').pop(),
      blobName,
      size: file.size,
      contentType: file.mimetype,
      url: blockBlobClient.url,
      status: 'Uploaded',
    };
  }

      



  async listFiles() {
    const { connectionString, containerName } = await this.getStorageConfig();

    const accountName = this.getConnectionStringValue(
      connectionString,
      'AccountName',
    );

    const accountKey = this.getConnectionStringValue(
      connectionString,
      'AccountKey',
    );

    if (!accountName || !accountKey) {
      throw new InternalServerErrorException(
        'AccountName or AccountKey could not be extracted from storage connection string',
      );
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey,
    );

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);

    const containerClient = blobServiceClient.getContainerClient(containerName);

    const files: any[] = [];

    for await (const blob of containerClient.listBlobsFlat()) {
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName,
          blobName: blob.name,
          permissions: BlobSASPermissions.parse('r'),
          startsOn: new Date(Date.now() - 5 * 60 * 1000),
          expiresOn: new Date(Date.now() + 60 * 60 * 1000),
        },
        sharedKeyCredential,
      ).toString();

      const blobUrl = `${containerClient.url}/${blob.name}`;
      const downloadUrl = `${blobUrl}?${sasToken}`;

      files.push({
        name: blob.name,
        size: blob.properties.contentLength,
        contentType: blob.properties.contentType,
        lastModified: blob.properties.lastModified,
        url: downloadUrl,
      });
    }

    return files;
  }

  private getConnectionStringValue(
    connectionString: string,
    key: string,
  ): string | null {
    const parts = connectionString.split(';');

    for (const part of parts) {
      const [k, ...rest] = part.split('=');
      if (k === key) {
        return rest.join('=');
      }
    }

    return null;
  }
}
