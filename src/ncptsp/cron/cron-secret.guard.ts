import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { timingSafeEqual } from 'node:crypto';

/** Giống ncptsp/src/lib/sync/auth.ts — Bearer CRON_SECRET */
@Injectable()
export class CronSecretGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.config.get<string>('CRON_SECRET');
    if (!secret) throw new UnauthorizedException();
    const req = context.switchToHttp().getRequest<Request>();
    const got = Buffer.from(req.headers.authorization ?? '');
    const want = Buffer.from(`Bearer ${secret}`);
    const ok = got.length === want.length && timingSafeEqual(got, want);
    if (!ok) throw new UnauthorizedException();
    return true;
  }
}
