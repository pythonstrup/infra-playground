import { initTracing } from '@shared/telemetry/tracing';

initTracing('gateway');

import { AppModule } from '@app/app.module';
import { NestFactory } from '@nestjs/core';
import { AllExceptionsFilter } from '@shared/logging/all-exceptions.filter';
import { WinstonLoggerService } from '@shared/logging/winston-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(WinstonLoggerService);
  app.useLogger(logger);
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  await app.listen(3000);
  logger.log('Gateway is running on http://localhost:3000', 'Bootstrap');
}

bootstrap();
