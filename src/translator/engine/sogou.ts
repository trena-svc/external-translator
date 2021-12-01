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
  zh: 'zh-CHS',
};

class SogouTranslator implements Translator {
  async init(page: Page, srcLang: Language, tgtLang: Language): Promise<void> {
    await page.goto('https://fanyi.sogou.com', { waitUntil: 'networkidle0' });

    const srcLangKey = languageKeyword[srcLang];
    const tgtLangKey = languageKeyword[tgtLang];

    await SogouTranslator.selectLanguageIfNotSelected(
      page,
      '.sl-selector',
      srcLangKey,
    );
    await SogouTranslator.selectLanguageIfNotSelected(
      page,
      '.tl-selector',
      tgtLangKey,
    );

    return Promise.resolve(undefined);
  }

  async translate(
    page: Page,
    srcLang: Language,
    tgtLang: Language,
    srcTextList: string[],
  ): Promise<string[]> {
    await page.click('#trans-input');
    await page.type('#trans-input', srcTextList.join('\n'));

    await page.waitForResponse((res) =>
      res.url().startsWith('https://fanyi.sogou.com/api/transpc/text/result'),
    );

    await page.waitForTimeout(500);

    const element = await page.waitForSelector(`#trans-result`);
    const value = await element.evaluate((el) =>
      (el as HTMLElement).innerText.trim(),
    );

    await page.click('.btn-clear');

    return value.split('\n');
  }

  private static async selectLanguageIfNotSelected(
    page: Page,
    selector: string,
    languageKey: string,
  ) {
    const targetLanguageSelector = `span[lang=${languageKey}]`;

    await page.click(selector);

    const selectorObj = await page.$(targetLanguageSelector);
    const property = await selectorObj.getProperty('className');
    const className = await property.jsonValue<string>();

    if (className.includes('selected')) {
      await page.click(selector);
    } else {
      await page.click(targetLanguageSelector);
    }
  }
}

const sogouTranslator = new SogouTranslator();
export default sogouTranslator;
