import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import 'multer'; 
@Injectable()
export class FilesService {
async uploadFile(file: Express.Multer.File, orderId?: string) {
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'attachmentsmramos';
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);
const safeOrderId = orderId || 'unassigned';
const blobName = `${safeOrderId}/${Date.now()}-${file.originalname}`;
const blockBlobClient = containerClient.getBlockBlobClient(blobName);
await blockBlobClient.uploadData(file.buffer, {
blobHTTPHeaders: { blobContentType: file.mimetype },
});
return {
orderId: safeOrderId,
fileName: file.originalname,
blobName,
size: file.size,
contentType: file.mimetype,
url: blockBlobClient.url,
status: 'Uploaded',
};

}

async listFiles() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
  if (!connectionString) {
  throw new InternalServerErrorException(
    'AZURE_STORAGE_CONNECTION_STRING is not configured',
  );
}
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'attachments';
if (!containerName) {
  throw new InternalServerErrorException(
    'AZURE_STORAGE_CONTAINER_NAME is not configured',
  );
}

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);

  const containerClient =
    blobServiceClient.getContainerClient(containerName);

  const files: any[] = [];

  for await (const blob of containerClient.listBlobsFlat()) {
    files.push({
      name: blob.name,
      size: blob.properties.contentLength,
      contentType: blob.properties.contentType,
      lastModified: blob.properties.lastModified,
      url: `${containerClient.url}/${blob.name}`,
    });
  }

  return files;
}

}