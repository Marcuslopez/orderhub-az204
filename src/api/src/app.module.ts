import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { HealthModule } from './health/health.module';
import { FilesModule } from './files/files.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { SecretsModule } from './secrets/secrets.module';
import { AuditModule } from './audit/audit.module';
import { SecretsService } from './secrets/secrets.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
      SecretsModule,
/*
 TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
*/
  TypeOrmModule.forRootAsync({
    imports: [SecretsModule],
    inject: [SecretsService],
    useFactory: async (secretsService: SecretsService) => ({
      type: 'mssql',
      host: await secretsService.getSecret('DB-HOST'),
      port: Number(await secretsService.getSecret('DB-PORT')),
      username: await secretsService.getSecret('DB-USERNAME'),
      password: await secretsService.getSecret('DB-PASSWORD'),
      database: await secretsService.getSecret('DB-NAME'),
      autoLoadEntities: true,
      synchronize: true,
      options: {
        encrypt: true,
        trustServerCertificate: false,
      },
    }),
  }),


    OrdersModule,
    HealthModule,
    FilesModule,
    AuthModule,
    SecretsModule,
    AuditModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}