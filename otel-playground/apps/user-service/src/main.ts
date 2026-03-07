import { initTracing } from '@shared/telemetry/tracing';

initTracing('user-service');

import { AppModule } from '@app/app.module';
import { seed } from '@app/seed';
import { MikroORM } from '@mikro-orm/core';
import { NestFactory } from '@nestjs/core';
import { AllExceptionsFilter } from '@shared/logging/all-exceptions.filter';
import { WinstonLoggerService } from '@shared/logging/winston-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(WinstonLoggerService);
  app.useLogger(logger);
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  const orm = app.get(MikroORM);
  await orm.getSchemaGenerator().updateSchema({ safe: true });
  await seed(orm, logger);

  await app.listen(3001);
  logger.log('User Service is running on http://localhost:3001', 'Bootstrap');
}

bootstrap();
