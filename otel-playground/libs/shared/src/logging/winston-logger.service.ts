import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { createFluentBitTransport } from '@shared/logging/fluent-bit.transport';
import { buildJsonFormat, buildPrettyFormat } from '@shared/logging/logging.formats';
import { LOGGING_MODULE_OPTIONS, type LoggingModuleOptions } from '@shared/logging/logging.types';
import type { transport as Transport } from 'winston';
import { createLogger, Logger, transports } from 'winston';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private readonly winston: Logger;

  constructor(@Inject(LOGGING_MODULE_OPTIONS) options: LoggingModuleOptions) {
    const jsonFormat = buildJsonFormat(options.serviceName);
    const consoleFormat = options.prettyPrint ? buildPrettyFormat(options.serviceName) : jsonFormat;

    const winstonTransports: Transport[] = [new transports.Console({ format: consoleFormat })];

    if (options.fluentBitUrl) {
      winstonTransports.push(createFluentBitTransport(options.fluentBitUrl, jsonFormat));
    }

    this.winston = createLogger({
      level: options.logLevel,
      transports: winstonTransports,
    });
  }

  log(message: string, context?: string): void {
    this.winston.info(message, { context });
  }

  error(message: string, trace?: string, context?: string): void {
    this.winston.error(message, { trace, context });
  }

  warn(message: string, context?: string): void {
    this.winston.warn(message, { context });
  }

  debug(message: string, context?: string): void {
    this.winston.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this.winston.verbose(message, { context });
  }
}
