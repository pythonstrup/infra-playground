import { Module } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { TypeConfigModule } from '../config/type-config.module';
import { TypeConfigService } from '../config/type-config.service';

@Module({
  imports: [
    TypeConfigModule,
    NestRedisModule.forRootAsync({
      useFactory: (config: TypeConfigService) => ({
        type: 'single',
        url: `redis://${config.get('REDIS_HOST')}:${config.get('REDIS_PORT')}`,
      }),
      inject: [TypeConfigService],
    }),
  ],
})
export class RedisModule {}
