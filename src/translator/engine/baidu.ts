import { Language, Translator } from '../translator';
import { Page } from 'puppeteer';

const languageKeyword = {
  de: 'de',
  en: 'en',
  es: 'spa',
  fr: 'fra',
  it: 'it',
  ja: 'jp',
  ko: 'kor',
  pt: 'pt',
  vi: 'vie',
  zh: 'zh',
};

class BaiduTranslator implements Translator {
  async init(page: Page, srcLang: Language, tgtLang: Language): Promise<void> {
    const srcLangKey = languageKeyword[srcLang];
    const tgtLangKey = languageKeyword[tgtLang];
    await page.goto(
      `https://fanyi.baidu.com/#${srcLangKey}/${tgtLangKey}/123`,
      { waitUntil: 'networkidle0' },
    );
    await page.click('.desktop-guide-close');
  }

  async translate(
    page: Page,
    srcLang: Language,
    tgtLang: Language,
    srcTextList: string[],
  ): Promise<string[]> {
    await page.click('.textarea-clear-btn');

    await page.click('#baidu_translate_input');
    await page.type('#baidu_translate_input', srcTextList.join('\n'));

    await page.waitForResponse((res) =>
      res.url().startsWith('https://fanyi.baidu.com/v2transapi'),
    );

    await page.waitForTimeout(500);

    const element = await page.waitForSelector(`.output-bd`);
    const value = await element.evaluate((el) =>
      (el as HTMLElement).innerText.trim(),
    );

    return value.split('\n');
  }
}

const baiduTranslator = new BaiduTranslator();
export default baiduTranslator;
