import { DynamicModule, Module } from '@nestjs/common';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

@Module({})
export class PuppeteerModule {
  static register(): DynamicModule {
    puppeteer.use(StealthPlugin());
    return {
      module: PuppeteerModule,
      providers: [
        {
          provide: 'PUPPETEER',
          useValue: puppeteer,
        },
      ],
      exports: [
        {
          provide: 'PUPPETEER',
          useValue: puppeteer,
        },
      ],
    };
  }
}
