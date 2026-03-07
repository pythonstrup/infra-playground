import {
  type DynamicModule,
  Global,
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { HttpLoggingMiddleware } from '@shared/logging/http-logging.middleware';
import { LOGGING_MODULE_OPTIONS, type LoggingModuleOptions } from '@shared/logging/logging.types';
import { WinstonLoggerService } from '@shared/logging/winston-logger.service';

@Global()
@Module({})
export class LoggingModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggingMiddleware).forRoutes('*');
  }

  static forRoot(options: LoggingModuleOptions): DynamicModule {
    const frozenOptions = Object.freeze({ ...options });
    return {
      module: LoggingModule,
      providers: [
        { provide: LOGGING_MODULE_OPTIONS, useValue: frozenOptions },
        WinstonLoggerService,
        HttpLoggingMiddleware,
      ],
      exports: [WinstonLoggerService],
    };
  }
}
