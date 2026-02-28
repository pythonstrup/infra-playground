import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { createStandaloneLogger } from '@shared/logging/create-logger';

let initialized = false;

export function initTracing(defaultServiceName: string): void {
  if (initialized) {
    return;
  }
  initialized = true;

  const logger = createStandaloneLogger(defaultServiceName);
  const logLevel = resolveLogLevel(process.env.OTEL_LOG_LEVEL);

  if (logLevel !== DiagLogLevel.NONE) {
    diag.setLogger(new DiagConsoleLogger(), logLevel);
  }

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: defaultServiceName,
    }),
    traceExporter: new OTLPTraceExporter(),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
      }),
    ],
  });

  sdk.start();
  logger.info(`OpenTelemetry tracing initialized for service: ${defaultServiceName}`);

  const shutdown = async () => {
    try {
      await sdk.shutdown();
      logger.info('OpenTelemetry SDK shut down successfully');
    } catch (err) {
      logger.error('Error shutting down OpenTelemetry SDK', { error: err });
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

function resolveLogLevel(value: string | undefined): DiagLogLevel {
  switch (value?.toLowerCase()) {
    case 'debug':
      return DiagLogLevel.DEBUG;
    case 'info':
      return DiagLogLevel.INFO;
    case 'warn':
      return DiagLogLevel.WARN;
    case 'error':
      return DiagLogLevel.ERROR;
    case 'none':
      return DiagLogLevel.NONE;
    default:
      return DiagLogLevel.NONE;
  }
}
