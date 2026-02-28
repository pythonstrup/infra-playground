import { initTracing } from '@shared/telemetry/tracing';

initTracing('notification-service');

import { AppModule } from '@app/app.module';
import { NestFactory } from '@nestjs/core';
import { WinstonLoggerService } from '@shared/logging/winston-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(WinstonLoggerService);
  app.useLogger(logger);

  await app.listen(3003);
  logger.log('Notification Service is running on http://localhost:3003', 'Bootstrap');
}

bootstrap();
