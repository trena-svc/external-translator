import { Language, Translator } from '../translator';
import { Page } from 'puppeteer';

const languageKeyword = {
  de: 'de',
  en: 'en',
  es: 'es',
  fr: 'fr',
  it: 'it',
  ja: 'jp',
  ko: 'kr',
  pt: 'pt',
  vi: 'vi',
  zh: 'cn',
};

class KakaoTranslator implements Translator {
  async init(page: Page, srcLang: Language, tgtLang: Language): Promise<void> {
    await page.goto('https://translate.kakao.com', {
      waitUntil: 'networkidle0',
    });

    const srcLangKey = languageKeyword[srcLang];
    const tgtLangKey = languageKeyword[tgtLang];

    const popupTag = await page.$('#noticeLayer');
    if (popupTag) {
      await page.click('.layer_foot .btn_close');
    }

    const [srcLangSelectionTag, tgtLangSelectionTag] = await page.$$(
      'a[name="selectedLanguage"]',
    );

    await srcLangSelectionTag.click();
    await page.click(`li[data-lang="${srcLangKey}"`);

    await tgtLangSelectionTag.click();

    const targetLanguageOptionTag = (
      await page.$$(`li[data-lang="${tgtLangKey}"`)
    )[1];
    await targetLanguageOptionTag.click();
  }

  async translate(
    page: Page,
    srcLang: Language,
    tgtLang: Language,
    srcTextList: string[],
  ): Promise<string[]> {
    await page.type('#query', srcTextList.join('\n'));

    await page.waitForResponse(
      'https://translate.kakao.com/translator/translate.json',
    );

    await page.waitForTimeout(500);

    const element = await page.waitForSelector(`#result`);
    const value = await element.evaluate((el) => (el as HTMLElement).innerText);

    await page.click('#btnClearInput');

    return value.split('\n');
  }
}

const kakaoTranslator = new KakaoTranslator();
export default kakaoTranslator;
