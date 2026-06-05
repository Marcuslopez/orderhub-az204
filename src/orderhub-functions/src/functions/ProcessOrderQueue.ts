import { app, InvocationContext } from '@azure/functions';
import * as sql from 'mssql';

type OrderMessage = {
  orderId: number;
};

export async function ProcessOrderQueue(
  queueItem: OrderMessage,
  context: InvocationContext,
): Promise<void> {
  context.log('Mensaje recibido:', queueItem);

  const orderId = queueItem.orderId;

  const pool = await sql.connect({
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST!,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 1433),
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
  });


  const result = await pool
    .request()
    .input('id', sql.Int, orderId)
    .query("UPDATE orders SET status = 'Processed' WHERE id = @id");

  context.log(`Filas actualizadas: ${result.rowsAffected[0]}`);
  context.log(`Orden ${orderId} actualizada a Processed`);
  await pool.close();
}

app.storageQueue('ProcessOrderQueue', {
  queueName: 'order-processing',
  connection: 'AzureWebJobsStorage',
  handler: ProcessOrderQueue,
});