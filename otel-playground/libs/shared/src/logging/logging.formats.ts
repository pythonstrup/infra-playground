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

export function buildJsonFormat(serviceName: string): Format {
  return combine(ecsFieldsFormat(serviceName), json());
}

export function buildPrettyFormat(serviceName: string): Format {
  return combine(
    ecsFieldsFormat(serviceName),
    colorize(),
    printf((info) => {
      const ts = info['@timestamp'] ?? new Date().toISOString();
      const logger = info['log.logger'] ? ` [${info['log.logger']}]` : '';
      return `${ts} ${info.level} [${info['service.name']}]${logger} ${info.message}`;
    }),
  );
}
