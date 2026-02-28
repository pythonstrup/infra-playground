import { Injectable } from '@nestjs/common';
import { AppConfig, OtelLogLevel } from './type-config.types';

const OTEL_LOG_LEVELS: readonly OtelLogLevel[] = ['debug', 'info', 'warn', 'error', 'none'];

@Injectable()
export class TypeConfigService {
  private readonly config: AppConfig = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    USER_SERVICE_URL: process.env.USER_SERVICE_URL ?? 'http://localhost:3001',
    ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL ?? 'http://localhost:3002',
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ??
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
      'http://localhost:4318/v1/traces',
    OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME ?? 'app',
    OTEL_LOG_LEVEL: this.resolveOtelLogLevel(process.env.OTEL_LOG_LEVEL),
    DATABASE_HOST: process.env.DATABASE_HOST ?? 'localhost',
    DATABASE_PORT: this.resolvePort(process.env.DATABASE_PORT, 54320),
    DATABASE_USER: process.env.DATABASE_USER ?? 'otel',
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD ?? 'otel',
    DATABASE_NAME: process.env.DATABASE_NAME ?? 'otel_playground',
    REDIS_HOST: process.env.REDIS_HOST ?? 'localhost',
    REDIS_PORT: this.resolvePort(process.env.REDIS_PORT, 63790),
  };

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  getPort(defaultPort: number): number {
    const rawPort = process.env.PORT;
    if (!rawPort) {
      return defaultPort;
    }

    const port = Number.parseInt(rawPort, 10);
    if (Number.isNaN(port) || port <= 0) {
      throw new Error(`Invalid PORT value: ${rawPort}`);
    }

    return port;
  }

  private resolvePort(value: string | undefined, defaultPort: number): number {
    if (!value) {
      return defaultPort;
    }
    const port = Number.parseInt(value, 10);
    if (Number.isNaN(port) || port <= 0) {
      return defaultPort;
    }
    return port;
  }

  private resolveOtelLogLevel(value: string | undefined): OtelLogLevel {
    if (!value) {
      return 'info';
    }
    if (OTEL_LOG_LEVELS.includes(value as OtelLogLevel)) {
      return value as OtelLogLevel;
    }
    return 'info';
  }
}
