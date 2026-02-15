import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as path from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Mandatory Environment Variable Validation
  const requiredEnvVars = [
    'MONGO_URL',
    'JWT_SECRET',
    'PRESIDENT_PASSCODE',
    'SUPERADMIN_PASSCODE'
  ];

  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  if (missingVars.length > 0) {
    logger.error(`CRITICAL ERROR: Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Serve static files from uploads directory - restricted access
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    index: false, // Disable directory indexing
  });

  // Production-Ready CORS
  const isProduction = process.env.NODE_ENV === 'production';
  app.enableCors({
    origin: isProduction
      ? [process.env.FRONTEND_URL || 'https://raportal.ogbc.org']
      : true, // Allow all in dev
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Strict Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger setup - only in non-production
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Royal Ambassadors of Nigeria API')
      .setDescription('The API documentation for the RA Digital Portal')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api`);
  if (!isProduction) {
    logger.log(`Swagger documentation: http://localhost:${port}/api/docs`);
  }
}
bootstrap();
