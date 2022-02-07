import { Module } from '@nestjs/common';
import { TranslatorService } from './service/translator.service';
import { TranslatorRunnerFactoryService } from './service/translator-runner-factory.service';
import { TranslatorController } from './translator.controller';
import { PuppeteerModule } from './puppeteer.module';
import { BullModule } from '@nestjs/bull';
import { TranslatorJobSubmissionService } from './service/translator-job-submission.service';
import { TranslatorRemoteProcessor } from './queue/translator-remote.processor';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ProxyServerService } from './service/proxy-server.service';
import { TranslatorLocalProcessor } from './queue/translator-local.processor';

@Module({
  imports: [
    HttpModule,
    PuppeteerModule.register(),
    BullModule.registerQueue({
      name: 'remote',
    }),
    BullModule.registerQueue({
      name: 'local',
    }),
  ],
  controllers: [TranslatorController],
  providers: [
    TranslatorService,
    TranslatorRunnerFactoryService,
    TranslatorJobSubmissionService,
    TranslatorRemoteProcessor,
    TranslatorLocalProcessor,
    ProxyServerService,
    ConfigService,
  ],
})
export class TranslatorModule {}
