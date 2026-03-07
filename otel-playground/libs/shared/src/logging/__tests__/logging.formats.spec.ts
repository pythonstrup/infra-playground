import { type Span, type SpanContext, TraceFlags, trace } from '@opentelemetry/api';
import { Writable } from 'stream';
import { createLogger, transports } from 'winston';
import { buildJsonFormat, buildPrettyFormat } from '../logging.formats';

const VALID_TRACE_ID = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4';
const VALID_SPAN_ID = 'f1e2d3c4b5a6f1e2';

function makeSpan(ctx: SpanContext): Span {
  return {
    spanContext: () => ctx,
    setAttribute: jest.fn(),
    setAttributes: jest.fn(),
    addEvent: jest.fn(),
    addLink: jest.fn(),
    addLinks: jest.fn(),
    setStatus: jest.fn(),
    updateName: jest.fn(),
    end: jest.fn(),
    isRecording: () => true,
    recordException: jest.fn(),
  };
}

function collectLog(
  format: ReturnType<typeof buildJsonFormat>,
  message: string,
): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const logger = createLogger({
      level: 'info',
      format,
      transports: [
        new transports.Stream({
          stream: new Writable({
            write(chunk, _encoding, callback) {
              resolve(JSON.parse(chunk.toString()));
              callback();
            },
          }),
        }),
      ],
    });
    logger.info(message);
  });
}

describe('buildJsonFormat', () => {
  it('injects trace context when active span exists', async () => {
    const span = makeSpan({
      traceId: VALID_TRACE_ID,
      spanId: VALID_SPAN_ID,
      traceFlags: TraceFlags.SAMPLED,
    });
    jest.spyOn(trace, 'getActiveSpan').mockReturnValue(span);

    const result = await collectLog(buildJsonFormat('test-svc'), 'hello');

    expect(result['trace.id']).toBe(VALID_TRACE_ID);
    expect(result['span.id']).toBe(VALID_SPAN_ID);
    expect(result['transaction.id']).toBe(VALID_SPAN_ID);
    expect(result['service.name']).toBe('test-svc');

    jest.restoreAllMocks();
  });

  it('omits trace fields when no active span', async () => {
    jest.spyOn(trace, 'getActiveSpan').mockReturnValue(undefined);

    const result = await collectLog(buildJsonFormat('test-svc'), 'no-trace');

    expect(result['trace.id']).toBeUndefined();
    expect(result['span.id']).toBeUndefined();
    expect(result['transaction.id']).toBeUndefined();
    expect(result.message).toBe('no-trace');

    jest.restoreAllMocks();
  });

  it('omits trace fields when span context is invalid', async () => {
    const span = makeSpan({
      traceId: '00000000000000000000000000000000',
      spanId: '0000000000000000',
      traceFlags: TraceFlags.NONE,
    });
    jest.spyOn(trace, 'getActiveSpan').mockReturnValue(span);

    const result = await collectLog(buildJsonFormat('test-svc'), 'invalid');

    expect(result['trace.id']).toBeUndefined();
    expect(result['span.id']).toBeUndefined();

    jest.restoreAllMocks();
  });
});

describe('buildPrettyFormat', () => {
  it('includes trace.id in formatted output when span is active', () => {
    const span = makeSpan({
      traceId: VALID_TRACE_ID,
      spanId: VALID_SPAN_ID,
      traceFlags: TraceFlags.SAMPLED,
    });
    jest.spyOn(trace, 'getActiveSpan').mockReturnValue(span);

    const fmt = buildPrettyFormat('test-svc');
    const result = fmt.transform({
      level: 'info',
      message: 'hello',
      [Symbol.for('level')]: 'info',
    });

    expect(result).not.toBe(false);
    if (result !== false) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const output = (result as any)[Symbol.for('message')] as string;
      expect(output).toContain(`trace=${VALID_TRACE_ID}`);
    }

    jest.restoreAllMocks();
  });
});
