import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

process.on('uncaughtException', (error: Error & { code?: string }) => {
  const logger = new Logger('TLS-ErrorHandler');
  if (error.code === 'ERR_SSL_BAD_RECORD_TYPE') {
    logger.warn('TLS error ignorado (servidor SMTP local sin TLS): ' + error.message);
    return;
  }
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
