export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggingModuleOptions {
  readonly serviceName: string;
  readonly logLevel: LogLevel;
  readonly prettyPrint: boolean;
  readonly fluentBitUrl?: string;
}

export const LOGGING_MODULE_OPTIONS = Symbol('LOGGING_MODULE_OPTIONS');

const LOG_LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error'];

export function resolveLoggingOptions(serviceName: string): LoggingModuleOptions {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isDev = nodeEnv !== 'production';
  const rawLevel = process.env.LOG_LEVEL;

  const logLevel: LogLevel =
    rawLevel && LOG_LEVELS.includes(rawLevel as LogLevel)
      ? (rawLevel as LogLevel)
      : isDev
        ? 'debug'
        : 'info';

  const fluentBitUrl = process.env.FLUENT_BIT_URL || undefined;

  return Object.freeze({ serviceName, logLevel, prettyPrint: isDev, fluentBitUrl });
}
