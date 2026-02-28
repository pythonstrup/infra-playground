import { OrderEntity } from '@app/entities/order.entity';
import { OrderController } from '@app/order.controller';
import { OrderService } from '@app/order.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeConfigModule } from '@shared/config/type-config.module';
import { DatabaseModule } from '@shared/database/database.module';
import { LoggingModule } from '@shared/logging/logging.module';
import { resolveLoggingOptions } from '@shared/logging/logging.types';
import { QueueModule } from '@shared/queue/queue.module';

@Module({
  imports: [
    HttpModule,
    TypeConfigModule,
    DatabaseModule,
    QueueModule,
    LoggingModule.forRoot(resolveLoggingOptions('order-service')),
    MikroOrmModule.forFeature([OrderEntity]),
    BullModule.registerQueue({ name: 'order-notification' }),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class AppModule {}
