import { NotificationProcessor } from '@app/notification.processor';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeConfigModule } from '@shared/config/type-config.module';
import { QueueModule } from '@shared/queue/queue.module';

@Module({
  imports: [
    HttpModule,
    TypeConfigModule,
    QueueModule,
    BullModule.registerQueue({ name: 'order-notification' }),
  ],
  providers: [NotificationProcessor],
})
export class AppModule {}
