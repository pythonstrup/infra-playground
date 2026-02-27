import { Injectable } from '@nestjs/common';
import { AppConfig, OtelLogLevel } from './type-config.types';

const OTEL_LOG_LEVELS: readonly OtelLogLevel[] = [
  'debug',
  'info',
  'warn',
  'error',
  'none',
];

@Injectable()
export class TypeConfigService {
  private readonly config: AppConfig = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    USER_SERVICE_URL: process.env.USER_SERVICE_URL ?? 'http://localhost:3001',
    ORDER_SERVICE_URL:
      process.env.ORDER_SERVICE_URL ?? 'http://localhost:3002',
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT:
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ??
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
      'http://localhost:8200/v1/traces',
    OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME ?? 'app',
    OTEL_LOG_LEVEL: this.resolveOtelLogLevel(process.env.OTEL_LOG_LEVEL),
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
