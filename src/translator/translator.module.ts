import { Module } from '@nestjs/common';
import { TranslatorService } from './service/translator.service';
import { TranslatorRunnerFactoryService } from './service/translator-runner-factory.service';
import { TranslatorController } from './translator.controller';
import { PuppeteerModule } from './puppeteer.module';
import { BullModule } from '@nestjs/bull';
import { TranslatorJobSubmissionService } from './service/translator-job-submission.service';
import { TranslatorProcessor } from './queue/translator.processor';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PuppeteerModule.register(),
    BullModule.registerQueueAsync({
      name: 'remote',
    }),
  ],
  controllers: [TranslatorController],
  providers: [
    TranslatorService,
    TranslatorRunnerFactoryService,
    TranslatorJobSubmissionService,
    TranslatorProcessor,
    ConfigService,
  ],
})
export class TranslatorModule {}
