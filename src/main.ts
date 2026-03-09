import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:            true,
      forbidNonWhitelisted: true,
      transform:            true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('EduCore API')
    .setDescription('Sistema de gestión escolar')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3000, '127.0.0.1');
  console.log('EduCore API corriendo en http://localhost:'+process.env.PORT+'/api/v1');
  console.log('Swagger en http://localhost:'+process.env.PORT+'/docs');
}

bootstrap();