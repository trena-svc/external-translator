import { Translator, TranslatorEngineType } from './translator';
import tencentTranslator from './engine/tencent';
import TranslatorRunner, { RunnerConfig } from './translator-runner';
import { Inject, Injectable } from '@nestjs/common';
import { PuppeteerExtra } from 'puppeteer-extra';
import naverTranslator from './engine/naver';
import kakaoTranslator from './engine/kakao';
import googleTranslator from './engine/google';
import baiduTranslator from './engine/baidu';
import sogouTranslator from './engine/sogou';
import bingTranslator from './engine/bing';

type RunnerCreationParams = {
  engineType: TranslatorEngineType;
} & Omit<RunnerConfig, 'translator' | 'puppeteer'>;

@Injectable()
export class TranslatorRunnerFactoryService {
  constructor(@Inject('PUPPETEER') private puppeteer: PuppeteerExtra) {}

  create({ engineType, ...ext }: RunnerCreationParams): TranslatorRunner {
    const engine = TranslatorRunnerFactoryService.createEngine(engineType);
    return new TranslatorRunner({
      ...ext,
      puppeteer: this.puppeteer,
      translator: engine,
    });
  }

  private static createEngine(engineType: TranslatorEngineType): Translator {
    switch (engineType) {
      case 'tencent':
        return tencentTranslator;
      case 'naver':
        return naverTranslator;
      case 'kakao':
        return kakaoTranslator;
      case 'google':
        return googleTranslator;
      case 'baidu':
        return baiduTranslator;
      case 'sogou':
        return sogouTranslator;
      case 'bing':
        return bingTranslator;
      default:
        throw new Error(`Not supported type: ${engineType}`);
    }
  }
}
