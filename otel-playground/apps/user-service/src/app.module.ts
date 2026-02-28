import { UserEntity } from '@app/entities/user.entity';
import { UserController } from '@app/user.controller';
import { UserService } from '@app/user.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { TypeConfigModule } from '@shared/config/type-config.module';
import { DatabaseModule } from '@shared/database/database.module';
import { LoggingModule } from '@shared/logging/logging.module';
import { resolveLoggingOptions } from '@shared/logging/logging.types';
import { RedisModule } from '@shared/redis/redis.module';

@Module({
  imports: [
    TypeConfigModule,
    DatabaseModule,
    RedisModule,
    LoggingModule.forRoot(resolveLoggingOptions('user-service')),
    MikroOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}
