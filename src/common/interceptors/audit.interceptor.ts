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

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const entityType = this.reflector.getAllAndOverride<string>(AUDITABLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!entityType) {
      return next.handle();
    }

    const req = context
      .switchToHttp()
      .getRequest<import('express').Request & { user?: any }>();
    const actorId = req.user?.sub;
    const ipAddress = req.ip;
    const method = req.method;

    let action = 'UNKNOWN';
    if (method === 'POST') action = 'CREATE';
    else if (method === 'PATCH' || method === 'PUT') action = 'UPDATE';
    else if (method === 'DELETE') action = 'DELETE';

    return next.handle().pipe(
      tap((response) => {
        const data = response?.data;
        if (data && data.id) {
          // Fire and forget audit log creation
          this.auditService
            .logAction(
              entityType,
              data.id,
              action,
              actorId,
              undefined, // We could capture body as new values if needed
              req.body,
              ipAddress,
            )
            .catch((e) => console.error('Audit logging failed', e));
        }
      }),
    );
  }
}
