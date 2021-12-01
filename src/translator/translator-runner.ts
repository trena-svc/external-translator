import { Language, Translator } from './translator';
import { Browser, Page } from 'puppeteer';
import random from 'lodash/random';
import { PuppeteerExtra, VanillaPuppeteer } from 'puppeteer-extra';
import { Logger } from '@nestjs/common';

export type RunnerConfig = {
  puppeteer: PuppeteerExtra;
  headless?: boolean;
  useProxy?: boolean;
  proxyList: string[];
  translator: Translator;
  srcLang: Language;
  tgtLang: Language;
};

export default class TranslatorRunner {
  private readonly logger = new Logger(TranslatorRunner.name);

  private readonly config: RunnerConfig;

  private closed: boolean;

  private prepared: boolean;

  private browser: Browser;

  private page: Page;

  constructor(config: RunnerConfig) {
    this.config = config;
    this.closed = true;
    this.prepared = false;
  }

  async prepare(): Promise<void> {
    const { srcLang, tgtLang } = this.config;

    if (this.closed) {
      this.browser = await this.getRandomProxyBrowser();
      this.page = await this.browser.newPage();

      this.page.setDefaultNavigationTimeout(30000);
      this.page.setDefaultTimeout(30000);
    }

    await this.config.translator.init(this.page, srcLang, tgtLang);

    this.prepared = true;
    this.closed = false;
  }

  async run(textList: string[]): Promise<string[]> {
    const { srcLang, tgtLang } = this.config;

    try {
      const nonEmptyInputTextList = [];
      const nonEmptyInputIdxList = [];
      const outputTextList = [];

      for (let i = 0; i < textList.length; i += 1) {
        const text = textList[i];
        outputTextList.push(text);
        if (text.length > 0) {
          nonEmptyInputTextList.push(text);
          nonEmptyInputIdxList.push(i);
        }
      }

      if (nonEmptyInputTextList.length > 0) {
        const resultList = await this.config.translator.translate(
          this.page,
          srcLang,
          tgtLang,
          nonEmptyInputTextList,
        );

        if (resultList.every((x) => x.length > 0)) {
          for (let i = 0; i < resultList.length; i += 1) {
            const idx = nonEmptyInputIdxList[i];
            outputTextList[idx] = resultList[i];
          }
        }
      }

      return outputTextList;
    } catch (err) {
      throw new Error(err);
    }
  }

  async close(): Promise<void> {
    let isSuccessful = true;
    isSuccessful = isSuccessful && (await this.closePage());
    isSuccessful = isSuccessful && (await this.closeBrowser());
    this.closed = true;

    if (!isSuccessful) {
      throw new Error('Failed to close page and browser');
    }
  }

  /**
   * Get browser using random proxy.
   */
  private async getRandomProxyBrowser() {
    const { proxyList, headless = true, useProxy = true } = this.config;

    const args: Parameters<VanillaPuppeteer['launch']>[0]['args'] = [
      '--incognito',
      '--hide-scrollbars',
      '--mute-audio',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      '--disable-dev-shm-usage',
    ];

    if (useProxy) {
      const proxy = proxyList[random(0, proxyList.length)];
      this.logger.log(`Open page with proxy: ${proxy}`);
      const proxyArg = `--proxy-server=${proxy}`;
      args.push(proxyArg);
    }

    return this.config.puppeteer.launch({
      ignoreHTTPSErrors: true,
      headless,
      args,
    });
  }

  /**
   * Close page and return status code which is true if it succeeds.
   *
   * @private
   */
  private async closePage() {
    if (!this.page) {
      return true;
    }

    try {
      await this.page.close();
      return true;
    } catch (inErr) {
      this.logger.error(inErr);
      return false;
    }
  }

  /**
   * Close browser and return status code which is 0 if it succeeds.
   *
   * @private
   */
  private async closeBrowser() {
    if (!this.browser) {
      return true;
    }
    try {
      await this.browser.close();
      return true;
    } catch (inErr) {
      this.logger.error(inErr);
      return false;
    }
  }
}
