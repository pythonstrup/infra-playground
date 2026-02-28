import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeConfigModule } from '@shared/config/type-config.module';
import { TypeConfigService } from '@shared/config/type-config.service';

@Module({
  imports: [
    TypeConfigModule,
    BullModule.forRootAsync({
      useFactory: (config: TypeConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
        },
      }),
      inject: [TypeConfigService],
    }),
  ],
})
export class QueueModule {}
