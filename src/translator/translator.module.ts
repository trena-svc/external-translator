import { Module } from '@nestjs/common';
import { TranslatorService } from './translator.service';
import { TranslatorRunnerFactoryService } from './translator-runner-factory.service';
import { TranslatorController } from './translator.controller';
import { PuppeteerModule } from './puppeteer.module';

@Module({
  imports: [PuppeteerModule.register()],
  controllers: [TranslatorController],
  providers: [TranslatorService, TranslatorRunnerFactoryService],
})
export class TranslatorModule {}
