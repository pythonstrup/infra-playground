import { initTracing } from '@shared/telemetry/tracing';

initTracing('gateway');

import { AppModule } from '@app/app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('Gateway is running on http://localhost:3000');
}

bootstrap();
