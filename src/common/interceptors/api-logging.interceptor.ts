import {
  Injectable,
  Logger,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import type { Request, Response } from 'express';

type RequestWithUser = Request & {
  user?: {
    sub?: string;
    email?: string;
    role?: string;
  };
};

@Injectable()
export class ApiLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ApiLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<RequestWithUser>();
    const response = httpContext.getResponse<Response>();
    const startedAt = Date.now();

    const requestId = this.getRequestId(request);
    const route = request.originalUrl || request.url;
    const userId = request.user?.sub || 'anonymous';
    const ipAddress = request.ip || request.socket.remoteAddress || 'unknown';

    this.logger.log(
      JSON.stringify({
        event: 'api.request.started',
        requestId,
        method: request.method,
        route,
        userId,
        ipAddress,
        query: request.query,
        body: this.sanitizeBody(request.body),
      }),
    );

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          JSON.stringify({
            event: 'api.request.completed',
            requestId,
            method: request.method,
            route,
            statusCode: response.statusCode,
            userId,
            durationMs: Date.now() - startedAt,
          }),
        );
      }),
      catchError((error: unknown) => {
        this.logger.error(
          JSON.stringify({
            event: 'api.request.failed',
            requestId,
            method: request.method,
            route,
            statusCode: response.statusCode,
            userId,
            durationMs: Date.now() - startedAt,
            errorName:
              error instanceof Error ? error.constructor.name : 'UnknownError',
            errorMessage:
              error instanceof Error ? error.message : 'Unknown error',
          }),
          error instanceof Error ? error.stack : undefined,
        );

        return throwError(() => error);
      }),
    );
  }

  private getRequestId(request: Request): string {
    const requestIdHeader = request.headers['x-request-id'];
    if (Array.isArray(requestIdHeader)) {
      return requestIdHeader[0] || 'unassigned';
    }
    return requestIdHeader || 'unassigned';
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveKeys = new Set([
      'password',
      'passwordHash',
      'accessToken',
      'refreshToken',
      'token',
      'authorization',
    ]);

    return Object.fromEntries(
      Object.entries(body as Record<string, unknown>).map(([key, value]) => [
        key,
        sensitiveKeys.has(key) ? '[REDACTED]' : value,
      ]),
    );
  }
}
