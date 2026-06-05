import 'dotenv/config';
import * as appInsights from 'applicationinsights';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights
    .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoCollectRequests(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectExceptions(true)
    //.setAutoCollectPerformance(true,true)
    .setAutoCollectConsole(true)
    .start();

  console.log('Application Insights initialized');
}

console.log(
  'AI:',
  process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
    ? 'CONFIGURADO'
    : 'NO CONFIGURADO',
);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ 
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', 
    allowedHeaders: 'Content-Type, Authorization', 
  });

const config = new DocumentBuilder()
  .setTitle('OrderHub API')
  .setDescription('API base para la Semana 1 de AZ-204')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Ingrese el JWT',
    },
    'JWT-auth',
  )
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

const port = process.env.PORT || 3000;
await app.listen(port);

  
  
}

bootstrap();