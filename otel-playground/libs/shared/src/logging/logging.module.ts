import { type DynamicModule, Global, Module } from '@nestjs/common';
import { LOGGING_MODULE_OPTIONS, type LoggingModuleOptions } from '@shared/logging/logging.types';
import { WinstonLoggerService } from '@shared/logging/winston-logger.service';

@Global()
@Module({})
export class LoggingModule {
  static forRoot(options: LoggingModuleOptions): DynamicModule {
    const frozenOptions = Object.freeze({ ...options });
    return {
      module: LoggingModule,
      providers: [
        { provide: LOGGING_MODULE_OPTIONS, useValue: frozenOptions },
        WinstonLoggerService,
      ],
      exports: [WinstonLoggerService],
    };
  }
}
