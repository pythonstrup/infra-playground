import { buildJsonFormat, buildPrettyFormat } from '@shared/logging/logging.formats';
import type { LoggingModuleOptions } from '@shared/logging/logging.types';
import { resolveLoggingOptions } from '@shared/logging/logging.types';
import { createLogger, type Logger, transports } from 'winston';

export function createStandaloneLogger(serviceName: string): Logger;
export function createStandaloneLogger(options: LoggingModuleOptions): Logger;
export function createStandaloneLogger(input: string | LoggingModuleOptions): Logger {
  const options = typeof input === 'string' ? resolveLoggingOptions(input) : input;

  const jsonFormat = buildJsonFormat(options.serviceName);
  const consoleFormat = options.prettyPrint ? buildPrettyFormat(options.serviceName) : jsonFormat;

  return createLogger({
    level: options.logLevel,
    transports: [new transports.Console({ format: consoleFormat })],
  });
}
