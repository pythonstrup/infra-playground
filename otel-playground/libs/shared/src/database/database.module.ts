import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Module } from '@nestjs/common';
import { TypeConfigModule } from '../config/type-config.module';
import { TypeConfigService } from '../config/type-config.service';

@Module({
  imports: [
    TypeConfigModule,
    MikroOrmModule.forRootAsync({
      useFactory: (config: TypeConfigService) => ({
        driver: PostgreSqlDriver,
        host: config.get('DATABASE_HOST'),
        port: config.get('DATABASE_PORT'),
        user: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASSWORD'),
        dbName: config.get('DATABASE_NAME'),
        autoLoadEntities: true,
        allowGlobalContext: true,
        debug: config.get('NODE_ENV') === 'development',
      }),
      inject: [TypeConfigService],
    }),
  ],
})
export class DatabaseModule {}
