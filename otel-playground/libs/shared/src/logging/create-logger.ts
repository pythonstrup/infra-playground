import { createFluentBitTransport } from '@shared/logging/fluent-bit.transport';
import { buildJsonFormat, buildPrettyFormat } from '@shared/logging/logging.formats';
import type { LoggingModuleOptions } from '@shared/logging/logging.types';
import { resolveLoggingOptions } from '@shared/logging/logging.types';
import type { transport as Transport } from 'winston';
import { createLogger, type Logger, transports } from 'winston';

export function createStandaloneLogger(serviceName: string): Logger;
export function createStandaloneLogger(options: LoggingModuleOptions): Logger;
export function createStandaloneLogger(input: string | LoggingModuleOptions): Logger {
  const options = typeof input === 'string' ? resolveLoggingOptions(input) : input;

  const jsonFormat = buildJsonFormat(options.serviceName);
  const consoleFormat = options.prettyPrint ? buildPrettyFormat(options.serviceName) : jsonFormat;

  const winstonTransports: Transport[] = [new transports.Console({ format: consoleFormat })];

  if (options.fluentBitUrl) {
    winstonTransports.push(createFluentBitTransport(options.fluentBitUrl, jsonFormat));
  }

  return createLogger({
    level: options.logLevel,
    transports: winstonTransports,
  });
}
