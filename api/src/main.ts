import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BusinessLogicExceptionFilter } from './shared/filters/business-logic-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
    defaultVersion: '1',
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Tyba technical test API')
    .setDescription('API for Tyba technical test')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Tyba')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new BusinessLogicExceptionFilter());
  await app.listen(3000);
}
bootstrap();
