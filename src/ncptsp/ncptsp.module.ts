import { Module } from '@nestjs/common';

import { CronSecretGuard } from './cron/cron-secret.guard';
import { CronSyncController } from './cron/cron-sync.controller';

@Module({
  controllers: [CronSyncController],
  providers: [CronSecretGuard],
})
export class NcptspModule {}
