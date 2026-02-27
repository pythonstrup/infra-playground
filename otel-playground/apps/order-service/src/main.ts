import { AppModule } from '@app/app.module';
import { MikroORM } from '@mikro-orm/core';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const orm = app.get(MikroORM);
  await orm.getSchemaGenerator().updateSchema({ safe: true });

  await app.listen(3002);
  console.log('Order Service is running on http://localhost:3002');
}

bootstrap();
