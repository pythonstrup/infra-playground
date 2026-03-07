import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WinstonLoggerService } from '@shared/logging/winston-logger.service';

interface HttpRequest {
  readonly method: string;
  readonly url: string;
}

interface HttpResponse {
  status(code: number): this;
  json(body: unknown): void;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: WinstonLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<HttpRequest>();
    const response = ctx.getResponse<HttpResponse>();

    const { status, message, stack } = this.extractErrorInfo(exception);

    this.logger.error(
      `${request.method} ${request.url} ${status} — ${message}`,
      stack,
      'ExceptionFilter',
    );

    response.status(status).json({
      statusCode: status,
      message: exception instanceof HttpException ? message : 'Internal Server Error',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private extractErrorInfo(exception: unknown): {
    status: number;
    message: string;
    stack?: string;
  } {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : ((res as { message?: string }).message ?? exception.message);
      return {
        status: exception.getStatus(),
        message: Array.isArray(message) ? message.join(', ') : message,
      };
    }

    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
        stack: exception.stack,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: String(exception),
    };
  }
}
