import { NotificationProcessor } from '@app/notification.processor';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeConfigModule } from '@shared/config/type-config.module';
import { LoggingModule } from '@shared/logging/logging.module';
import { resolveLoggingOptions } from '@shared/logging/logging.types';
import { QueueModule } from '@shared/queue/queue.module';

@Module({
  imports: [
    HttpModule,
    TypeConfigModule,
    QueueModule,
    LoggingModule.forRoot(resolveLoggingOptions('notification-service')),
    BullModule.registerQueue({ name: 'order-notification' }),
  ],
  providers: [NotificationProcessor],
})
export class AppModule {}
