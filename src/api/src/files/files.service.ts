import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  BlobServiceClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import 'multer';

@Injectable()
export class FilesService {
  async uploadFile(file: Express.Multer.File, orderId?: string) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
    const containerName =
      process.env.AZURE_STORAGE_CONTAINER_NAME || 'attachmentsmramos';

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);

    const containerClient = blobServiceClient.getContainerClient(containerName);

    const safeOrderId = orderId || 'unassigned';

    const cleanFileName = file.originalname.replace(/\s+/g, '-');
    const blobName = `${safeOrderId}/${safeOrderId}-${Date.now()}-${cleanFileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
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
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!connectionString) {
      throw new InternalServerErrorException(
        'AZURE_STORAGE_CONNECTION_STRING is not configured',
      );
    }

    const containerName =
      process.env.AZURE_STORAGE_CONTAINER_NAME || 'attachmentsmramos';

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
        'AccountName or AccountKey could not be extracted from AZURE_STORAGE_CONNECTION_STRING',
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