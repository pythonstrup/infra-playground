import { initTracing } from '@shared/telemetry/tracing';

initTracing('user-service');

import { AppModule } from '@app/app.module';
import { seed } from '@app/seed';
import { MikroORM } from '@mikro-orm/core';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const orm = app.get(MikroORM);
  await orm.getSchemaGenerator().updateSchema({ safe: true });
  await seed(orm);

  await app.listen(3001);
  console.log('User Service is running on http://localhost:3001');
}

bootstrap();
