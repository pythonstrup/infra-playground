import { HttpLoggingMiddleware } from '../http-logging.middleware';
import type { ContextLogger } from '../winston-logger.service';
import { WinstonLoggerService } from '../winston-logger.service';

type EventListener = () => void;

function createMockResponse() {
  const listeners: Record<string, EventListener[]> = {};
  return {
    statusCode: 200,
    writableFinished: true,
    on(event: string, listener: EventListener) {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(listener);
    },
    emit(event: string) {
      (listeners[event] ?? []).forEach((fn) => fn());
    },
  };
}

function createMockLoggerService() {
  const contextLogger: jest.Mocked<ContextLogger> = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };
  const service = {
    forContext: jest.fn().mockReturnValue(contextLogger),
  } as unknown as WinstonLoggerService;
  return { service, contextLogger };
}

describe('HttpLoggingMiddleware', () => {
  it('logs request on finish', () => {
    const { service, contextLogger } = createMockLoggerService();
    const middleware = new HttpLoggingMiddleware(service);
    const req = { method: 'GET', originalUrl: '/users' };
    const res = createMockResponse();
    const next = jest.fn();

    middleware.use(req, res, next);
    expect(next).toHaveBeenCalled();

    res.emit('finish');

    expect(contextLogger.log).toHaveBeenCalledTimes(1);
    expect(contextLogger.log).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/users 200 \d+ms$/),
    );
  });

  it('logs aborted request on close without finish', () => {
    const { service, contextLogger } = createMockLoggerService();
    const middleware = new HttpLoggingMiddleware(service);
    const req = { method: 'POST', originalUrl: '/upload' };
    const res = createMockResponse();
    res.writableFinished = false;
    const next = jest.fn();

    middleware.use(req, res, next);
    res.emit('close');

    expect(contextLogger.log).toHaveBeenCalledTimes(1);
    expect(contextLogger.log).toHaveBeenCalledWith(
      expect.stringMatching(/^POST \/upload 200 \d+ms \[aborted\]$/),
    );
  });

  it('does not double-log when finish fires before close', () => {
    const { service, contextLogger } = createMockLoggerService();
    const middleware = new HttpLoggingMiddleware(service);
    const req = { method: 'GET', originalUrl: '/health' };
    const res = createMockResponse();
    const next = jest.fn();

    middleware.use(req, res, next);
    res.emit('finish');
    res.emit('close');

    expect(contextLogger.log).toHaveBeenCalledTimes(1);
  });

  it('creates context logger with "HTTP" context', () => {
    const { service } = createMockLoggerService();
    new HttpLoggingMiddleware(service);

    expect(service.forContext).toHaveBeenCalledWith('HTTP');
  });

  it('proves logged guard prevents double-logging (finish → close)', () => {
    const { service, contextLogger } = createMockLoggerService();
    const middleware = new HttpLoggingMiddleware(service);
    const req = { method: 'GET', originalUrl: '/test' };
    const res = createMockResponse();

    middleware.use(req, res, jest.fn());

    // Node.js normal flow: finish fires, then close fires
    res.emit('finish');
    expect(contextLogger.log).toHaveBeenCalledTimes(1);

    res.emit('close');
    // Without the guard, this would be 2. With the guard, still 1.
    expect(contextLogger.log).toHaveBeenCalledTimes(1);
  });

  it('proves each request gets its own isolated closure', () => {
    const { service, contextLogger } = createMockLoggerService();
    const middleware = new HttpLoggingMiddleware(service);

    const res1 = createMockResponse();
    const res2 = createMockResponse();

    // Two separate requests
    middleware.use({ method: 'GET', originalUrl: '/a' }, res1, jest.fn());
    middleware.use({ method: 'GET', originalUrl: '/b' }, res2, jest.fn());

    res1.emit('finish');
    res1.emit('close');
    res2.emit('finish');
    res2.emit('close');

    // Each request logged exactly once, total 2
    expect(contextLogger.log).toHaveBeenCalledTimes(2);
    expect(contextLogger.log).toHaveBeenCalledWith(expect.stringContaining('/a'));
    expect(contextLogger.log).toHaveBeenCalledWith(expect.stringContaining('/b'));
  });
});
