import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { Public } from '../../common/decorators/public.decorator';
import { CronSecretGuard } from './cron-secret.guard';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { syncAll } = require('@ncptsp/core') as {
  syncAll: (opts?: Record<string, unknown>) => Promise<unknown>;
};

const MAX_CHAIN = 6;

/** Mirror ncptsp/src/app/api/cron/sync/route.ts */
@Controller('cron')
@Public()
@UseGuards(CronSecretGuard)
export class CronSyncController {
  constructor(private readonly config: ConfigService) {}

  @Get('sync')
  async sync(@Req() req: Request, @Res() res: Response) {
    const params = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`)
      .searchParams;
    const days = Math.min(Number(params.get('days')) || 3, 730);
    const postDays = Math.min(Number(params.get('postDays')) || 30, 365);
    const full = params.get('full') === '1';
    const chain = Math.max(0, Number(params.get('chain')) || 0);
    const opts = {
      days,
      postDays,
      ...(full && chain === 0 ? { heavy: true as const, minAgeMin: 0 } : {}),
    };

    if (params.get('wait') === '1') {
      const results = await syncAll(opts);
      return res.status(HttpStatus.OK).json({ days, postDays, results });
    }
    const workerBase =
      this.config.get<string>('WORKER_PUBLIC_URL')?.replace(/\/$/, '') ??
      `${req.protocol}://${req.get('host')}`;

    void (async () => {
      let left = 0;
      try {
        await syncAll({
          ...opts,
          onBatch: (b: { left: number }) => {
            left = b.left;
          },
        });
      } catch (e) {
        console.error('sync batch lỗi', e);
        return;
      }
      if (left > 0 && chain < MAX_CHAIN) {
        const next = new URL(`${workerBase}/api/cron/sync`);
        next.searchParams.set('days', String(days));
        next.searchParams.set('postDays', String(postDays));
        next.searchParams.set('chain', String(chain + 1));
        try {
          await fetch(next, {
            headers: {
              authorization: req.headers.authorization ?? '',
            },
            signal: AbortSignal.timeout(20_000),
          });
        } catch (e) {
          console.error('không nối được lô kế tiếp', e);
        }
      }
    })();

    return res.status(HttpStatus.ACCEPTED).json({ accepted: true, chain });
  }
}
