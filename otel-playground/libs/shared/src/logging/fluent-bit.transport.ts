import type { Format } from 'logform';
import { transports } from 'winston';

export function createFluentBitTransport(
  url: string,
  jsonFormat: Format,
): InstanceType<typeof transports.Http> {
  const parsed = new URL(url);

  return new transports.Http({
    host: parsed.hostname,
    port: Number(parsed.port) || 24224,
    path: parsed.pathname === '/' ? '/' : parsed.pathname,
    ssl: parsed.protocol === 'https:',
    format: jsonFormat,
  });
}
