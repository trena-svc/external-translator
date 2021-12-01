import { Language, Translator } from '../translator';
import { Page } from 'puppeteer';

const languageKeyword = {
  de: 'de',
  en: 'en',
  es: 'es',
  fr: 'fr',
  it: 'it',
  ja: 'ja',
  ko: 'ko',
  pt: 'pt',
  vi: 'vi',
  zh: 'zh-Hans',
};

class BingTranslator implements Translator {
  async init(page: Page, srcLang: Language, tgtLang: Language): Promise<void> {
    await page.goto('https://www.bing.com/translator', {
      waitUntil: 'networkidle0',
    });

    const srcLangKey = languageKeyword[srcLang];
    const tgtLangKey = languageKeyword[tgtLang];

    await page.select('#tta_srcsl', srcLangKey);
    await page.select('#tta_tgtsl', tgtLangKey);
  }

  async translate(
    page: Page,
    srcLang: Language,
    tgtLang: Language,
    srcTextList: string[],
  ): Promise<string[]> {
    await page.type('#tta_input_ta', srcTextList.join('\n'));

    await page.waitForResponse((res) =>
      res.url().startsWith('https://www.bing.com/ttranslatev3'),
    );

    await page.waitForTimeout(500);

    const element = await page.waitForSelector(`#tta_output_ta`);
    const value = await element.evaluate((el) =>
      (el as HTMLTextAreaElement).value.trim(),
    );

    await page.evaluate(
      () =>
        ((
          document.querySelector('#tta_input_ta') as HTMLTextAreaElement
        ).value = ''),
    );

    return value.split('\n');
  }
}

const bingTranslator = new BingTranslator();
export default bingTranslator;
