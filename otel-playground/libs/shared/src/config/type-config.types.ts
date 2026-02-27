export type OtelLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

export interface AppConfig {
  NODE_ENV: string;
  USER_SERVICE_URL: string;
  ORDER_SERVICE_URL: string;
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: string;
  OTEL_SERVICE_NAME: string;
  OTEL_LOG_LEVEL: OtelLogLevel;
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
}
