import { isSpanContextValid, trace } from '@opentelemetry/api';
import type { Format } from 'logform';
import os from 'os';
import { format } from 'winston';

const { combine, printf, colorize, json } = format;

const ecsFieldsFormat = (serviceName: string) => {
  const hostname = os.hostname();
  return format((info) => ({
    ...info,
    '@timestamp': new Date().toISOString(),
    'log.level': info.level,
    'service.name': serviceName,
    'host.name': hostname,
  }))();
};

const traceContextFormat = () =>
  format((info) => {
    const span = trace.getActiveSpan();
    if (!span) return info;

    const ctx = span.spanContext();
    if (!isSpanContextValid(ctx)) return info;

    return {
      ...info,
      'trace.id': ctx.traceId,
      'span.id': ctx.spanId,
      'transaction.id': ctx.spanId,
    };
  })();

export function buildJsonFormat(serviceName: string): Format {
  return combine(ecsFieldsFormat(serviceName), traceContextFormat(), json());
}

export function buildPrettyFormat(serviceName: string): Format {
  return combine(
    ecsFieldsFormat(serviceName),
    traceContextFormat(),
    colorize(),
    printf((info) => {
      const ts = info['@timestamp'] ?? new Date().toISOString();
      const logger = info['log.logger'] ? ` [${info['log.logger']}]` : '';
      const traceId = info['trace.id'] ? ` trace=${info['trace.id']}` : '';
      return `${ts} ${info.level} [${info['service.name']}]${logger}${traceId} ${info.message}`;
    }),
  );
}
