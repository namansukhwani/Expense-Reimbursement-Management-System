import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';
import { AUDITABLE_KEY } from '../decorators/auditable.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const entityType = this.reflector.getAllAndOverride<string>(AUDITABLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!entityType) {
      return next.handle();
    }

    const req = context
      .switchToHttp()
      .getRequest<import('express').Request & { user?: { sub: string } }>();
    const actorId = req.user?.sub;
    const ipAddress = req.ip;
    const method = req.method;

    let action = 'UNKNOWN';
    if (method === 'POST') action = 'CREATE';
    else if (method === 'PATCH' || method === 'PUT') action = 'UPDATE';
    else if (method === 'DELETE') action = 'DELETE';

    return next.handle().pipe(
      tap((response: unknown) => {
        const res = response as Record<string, unknown>;
        const data = res?.data as Record<string, unknown>;
        if (data && typeof data.id === 'string') {
          // Fire and forget audit log creation
          this.auditService
            .logAction(
              entityType,
              data.id,
              action,
              actorId,
              undefined,
              req.body as Record<string, unknown>,
              ipAddress,
            )
            .catch((e) => console.error('Audit logging failed', e));
        }
      }),
    );
  }
}
