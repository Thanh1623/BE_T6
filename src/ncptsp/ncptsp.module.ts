import { Module } from '@nestjs/common';

import { CronSecretGuard } from './cron/cron-secret.guard';
import { CronSpuSummaryController } from './cron/cron-spu-summary.controller';
import { CronSyncController } from './cron/cron-sync.controller';
import { CronVideosController } from './cron/cron-videos.controller';

@Module({
  controllers: [
    CronSyncController,
    CronSpuSummaryController,
    CronVideosController,
  ],
  providers: [CronSecretGuard],
})
export class NcptspModule {}
