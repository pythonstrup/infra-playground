import type { Format } from 'logform';
import { format } from 'winston';

const { combine, printf, colorize, json } = format;

const ecsTimestampFormat = format((info) => ({
  ...info,
  '@timestamp': new Date().toISOString(),
}))();

const serviceNameFormat = (serviceName: string) =>
  format((info) => ({
    ...info,
    service: serviceName,
  }))();

export function buildJsonFormat(serviceName: string): Format {
  return combine(ecsTimestampFormat, serviceNameFormat(serviceName), json());
}

export function buildPrettyFormat(serviceName: string): Format {
  return combine(
    ecsTimestampFormat,
    serviceNameFormat(serviceName),
    colorize(),
    printf((info) => {
      const ts = info['@timestamp'] ?? new Date().toISOString();
      const ctx = info.context ? ` [${info.context}]` : '';
      return `${ts} ${info.level} [${info.service}]${ctx} ${info.message}`;
    }),
  );
}
