import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { NcptspModule } from './ncptsp/ncptsp.module';

@Module({
  imports: [AppConfigModule, HealthModule, NcptspModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}