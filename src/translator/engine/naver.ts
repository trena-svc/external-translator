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
  zh: 'zh-CN',
};

class NaverTranslator implements Translator {
  async init(page: Page, srcLang: Language, tgtLang: Language): Promise<void> {
    const srcLangKey = languageKeyword[srcLang];
    const trgLangKey = languageKeyword[tgtLang];

    await page.goto(
      `https://papago.naver.com/?sk=${srcLangKey}&tk=${trgLangKey}`,
      { waitUntil: 'networkidle0' },
    );
  }

  async translate(
    page: Page,
    srcLang: Language,
    tgtLang: Language,
    srcTextList: string[],
  ): Promise<string[]> {
    await page.click('#txtSource');
    await page.type('#txtSource', srcTextList.join('\n'));

    await page.waitForResponse('https://papago.naver.com/apis/n2mt/translate');
    await page.waitForTimeout(500);

    const element = await page.waitForSelector(`#txtTarget span`);
    const value = await element.evaluate((el) => (el as HTMLElement).innerText);

    await page.click('#sourceEditArea button');

    return value.trim().split('\n');
  }
}

const naverTranslator = new NaverTranslator();
export default naverTranslator;
