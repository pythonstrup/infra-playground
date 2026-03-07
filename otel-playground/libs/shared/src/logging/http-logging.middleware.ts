import { Injectable, type NestMiddleware } from '@nestjs/common';
import { context } from '@opentelemetry/api';
import { type ContextLogger, WinstonLoggerService } from '@shared/logging/winston-logger.service';

interface HttpRequest {
  readonly method: string;
  readonly originalUrl: string;
}

interface HttpResponse {
  readonly statusCode: number;
  readonly writableFinished: boolean;
  on(event: string, listener: () => void): void;
}

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  private readonly logger: ContextLogger;

  constructor(loggerService: WinstonLoggerService) {
    this.logger = loggerService.forContext('HTTP');
  }

  use(req: HttpRequest, res: HttpResponse, next: () => void): void {
    const start = Date.now();
    let logged = false;

    const activeContext = context.active();
    const logRequest = context.bind(activeContext, (aborted: boolean) => {
      if (logged) return;
      logged = true;
      const duration = Date.now() - start;
      const suffix = aborted ? ' [aborted]' : '';
      this.logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms${suffix}`);
    });

    res.on('finish', () => logRequest(false));
    res.on('close', () => logRequest(!res.writableFinished));

    next();
  }
}
