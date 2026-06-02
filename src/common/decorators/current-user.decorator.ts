import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<
        import('express').Request & { user?: Record<string, unknown> }
      >();
    const user = request.user;
    if (!user) return undefined;
    if (data === 'sub' || data === 'id') {
      return user.id || user.sub;
    }
    return data && typeof data === 'string' ? user[data] : user;
  },
);
