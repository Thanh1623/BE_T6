import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayloadUser } from '../interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayloadUser | undefined => {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: JwtPayloadUser }>();
    return request.user;
  },
);
