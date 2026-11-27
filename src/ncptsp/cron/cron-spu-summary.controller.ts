import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { Public } from '../../common/decorators/public.decorator';
import { CronSecretGuard } from './cron-secret.guard';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const handlers = require('@ncptsp/core/spu-summary') as {
  checkSpuSummary: () => Promise<unknown>;
  checkSpuParity: () => Promise<unknown>;
  checkVideoDaily: () => Promise<unknown>;
  refreshVideoDaily: (opts: { full: boolean }) => Promise<unknown>;
  refreshTeamLines: (rebuild: boolean) => Promise<unknown>;
  summaryNeedsRefresh: () => Promise<{ yes: boolean; reason: string }>;
  refreshSpuSummary: () => Promise<{ ok: boolean; error?: string }>;
};

/** Mirror ncptsp/src/app/api/cron/spu-summary/route.ts */
@Controller('cron')
@Public()
@UseGuards(CronSecretGuard)
export class CronSpuSummaryController {
  @Get('spu-summary')
  async spuSummary(@Req() req: Request, @Res() res: Response) {
    const params = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`)
      .searchParams;

    if (params.get('check') === '1') {
      return res.json(await handlers.checkSpuSummary());
    }
    if (params.get('check') === '2') {
      return res.json(await handlers.checkSpuParity());
    }
    if (params.get('lines') === 'refresh') {
      return res.json(await handlers.refreshTeamLines(true));
    }
    if (params.get('check') === '3') {
      return res.json(await handlers.checkVideoDaily());
    }
    if (params.get('video') === 'inc' || params.get('video') === 'full') {
      return res.json(
        await handlers.refreshVideoDaily({
          full: params.get('video') === 'full',
        }),
      );
    }
    if (params.get('ifchanged') === '1') {
      const need = await handlers.summaryNeedsRefresh();
      if (!need.yes) {
        return res.json({ skipped: true, reason: need.reason });
      }
      console.log('[spu-summary] chốt sau đồng bộ — làm mới vì:', need.reason);
    }
    if (params.get('wait') === '1') {
      return res.json(await handlers.refreshSpuSummary());
    }

    void (async () => {
      const r = await handlers.refreshSpuSummary();
      if (!r.ok) {
        console.error('làm mới bảng tổng hợp SPU lỗi:', r.error);
      }
    })();

    return res.status(HttpStatus.ACCEPTED).json({ accepted: true });
  }
}
