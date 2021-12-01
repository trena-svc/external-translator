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

class GoogleTranslator implements Translator {
  async init(page: Page, srcLang: Language, tgtLang: Language): Promise<void> {
    const srcLangKey = languageKeyword[srcLang];
    const tgtLangKey = languageKeyword[tgtLang];
    await page.goto(
      `https://translate.google.com/?sl=${srcLangKey}&tl=${tgtLangKey}&op=translate`,
    );
  }

  async translate(
    page: Page,
    srcLang: Language,
    tgtLang: Language,
    srcTextList: string[],
  ): Promise<string[]> {
    const srcLangKey = languageKeyword[srcLang];
    const tgtLangKey = languageKeyword[tgtLang];

    await page.click('textarea');
    await page.type('textarea', srcTextList.join('\n'));

    await page.waitForTimeout(100);
    await page.waitForSelector(`span[lang=${tgtLangKey}]`, { visible: true });
    await page.waitForSelector(`span[lang=${tgtLangKey}] div`, {
      visible: false,
    });
    const element = await page.waitForSelector(`span[lang=${tgtLangKey}]`);
    const value = await element.evaluate((el) => (el as HTMLElement).innerText);

    await page.click(`span[lang=${srcLangKey}] ~ div button`);
    return value.split('\n');
  }
}

const googleTranslator = new GoogleTranslator();
export default googleTranslator;
