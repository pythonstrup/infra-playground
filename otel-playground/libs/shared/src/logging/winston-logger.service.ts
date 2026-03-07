import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { buildJsonFormat, buildPrettyFormat } from '@shared/logging/logging.formats';
import { LOGGING_MODULE_OPTIONS, type LoggingModuleOptions } from '@shared/logging/logging.types';
import { createLogger, Logger, transports } from 'winston';

export interface ContextLogger {
  log(message: string): void;
  error(message: string, trace?: string): void;
  warn(message: string): void;
  debug(message: string): void;
  verbose(message: string): void;
}

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private readonly winston: Logger;

  constructor(@Inject(LOGGING_MODULE_OPTIONS) options: LoggingModuleOptions) {
    const jsonFormat = buildJsonFormat(options.serviceName);
    const consoleFormat = options.prettyPrint ? buildPrettyFormat(options.serviceName) : jsonFormat;

    this.winston = createLogger({
      level: options.logLevel,
      transports: [new transports.Console({ format: consoleFormat })],
    });
  }

  forContext(context: string): ContextLogger {
    return {
      log: (message: string) => this.log(message, context),
      error: (message: string, trace?: string) => this.error(message, trace, context),
      warn: (message: string) => this.warn(message, context),
      debug: (message: string) => this.debug(message, context),
      verbose: (message: string) => this.verbose(message, context),
    };
  }

  log(message: string, context?: string): void {
    this.winston.info(message, { 'log.logger': context });
  }

  error(message: string, trace?: string, context?: string): void {
    this.winston.error(message, { trace, 'log.logger': context });
  }

  warn(message: string, context?: string): void {
    this.winston.warn(message, { 'log.logger': context });
  }

  debug(message: string, context?: string): void {
    this.winston.debug(message, { 'log.logger': context });
  }

  verbose(message: string, context?: string): void {
    this.winston.verbose(message, { 'log.logger': context });
  }
}
