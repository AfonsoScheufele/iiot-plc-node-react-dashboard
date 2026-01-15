import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { convertToHypertable } from './migrations/timescaledb-migration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  try {
    const dataSource = app.get(DataSource);
    await convertToHypertable(dataSource);
  } catch (error) {
    console.warn('⚠️  Aviso ao configurar TimescaleDB (pode ser normal na primeira execução):', error.message);
  }

  const config = new DocumentBuilder()
    .setTitle('IIoT API')
    .setDescription('API para monitoramento de máquinas industriais com Modbus, TimescaleDB, WebSockets e OEE')
    .setVersion('2.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend API rodando em http://localhost:${port}`);
  console.log(`📚 Swagger disponível em http://localhost:${port}/api`);
}

bootstrap();





