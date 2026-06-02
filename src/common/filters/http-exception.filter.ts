import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const errorObj = res as Record<string, unknown>;
        code =
          (errorObj.code as string) ||
          (errorObj.error
            ? (errorObj.error as string).replace(/\s+/g, '_').toUpperCase()
            : 'ERROR');
        message = (errorObj.message as string) || (errorObj.error as string);
        if (Array.isArray(errorObj.message)) {
          details = errorObj.message;
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
        }
      } else {
        message = String(res);
      }
    }

    this.logger.error(
      JSON.stringify({
        event: 'api.exception',
        method: request.method,
        route: request.originalUrl || request.url,
        statusCode: status,
        code,
        message,
        details,
      }),
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
    });
  }
}
