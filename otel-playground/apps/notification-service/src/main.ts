import { AppModule } from '@app/app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3003);
  console.log('Notification Service is running on http://localhost:3003');
}

bootstrap();
