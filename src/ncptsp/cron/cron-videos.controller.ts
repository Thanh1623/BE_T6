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
const { runApiVideoSync } = require('@ncptsp/core/videos') as {
  runApiVideoSync: () => Promise<unknown>;
};

/** Mirror ncptsp/src/app/api/cron/videos/route.ts */
@Controller('cron')
@Public()
@UseGuards(CronSecretGuard)
export class CronVideosController {
  @Get('videos')
  async videos(@Req() req: Request, @Res() res: Response) {
    const wait =
      new URL(
        req.url,
        `http://${req.headers.host ?? 'localhost'}`,
      ).searchParams.get('wait') === '1';

    if (wait) {
      return res.json(await runApiVideoSync());
    }

    void (async () => {
      await runApiVideoSync();
    })();

    return res.status(HttpStatus.ACCEPTED).json({ accepted: true });
  }
}
