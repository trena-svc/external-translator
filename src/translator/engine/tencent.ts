import { Page } from 'puppeteer';
import { Language, Translator } from '../translator';

const languageKeyword = {
  de: '德语',
  en: '英语',
  es: '西班牙语',
  fr: '法语',
  it: '意大利语',
  ja: '日语',
  ko: '韩语',
  pt: '葡萄牙语',
  vi: '越南语',
  zh: '中文',
};

class TencentTranslator implements Translator {
  async init(page: Page, srcLang: Language, tgtLang: Language): Promise<void> {
    await page.goto('https://fanyi.qq.com', { waitUntil: 'networkidle0' });

    const srcLangKey = languageKeyword[srcLang];
    const trgLangKey = languageKeyword[tgtLang];

    await page.click('div[node-type="source_language_button"]');
    const [srcLangKeyTag] = await page.$x(
      `//*[@id="language-button-group-source"]//span[contains(., "${srcLangKey}")]`,
    );
    await srcLangKeyTag.click();

    await page.click('div[node-type="target_language_button"]');
    const [tgtLangKeyTag] = await page.$x(
      `//*[@id="language-button-group-target"]//span[contains(., "${trgLangKey}")]`,
    );
    await tgtLangKeyTag.click();
  }

  async translate(
    page: Page,
    srcLang: Language,
    tgtLang: Language,
    inputTextList: string[],
  ): Promise<string[]> {
    await page.type(
      'textarea[node-type="source-textarea"]',
      inputTextList.join('\n'),
    );

    await page.waitForResponse('https://fanyi.qq.com/api/translate');
    await page.waitForTimeout(500);

    const element = await page.waitForSelector(`.textpanel-target-textblock`);
    const value = await element.evaluate((el) => (el as HTMLElement).innerText);
    await page.evaluate(() => {
      (document.querySelector('.tool-close') as HTMLDivElement).click();
    });

    return value.trim().split('\n');
  }
}

const tencentTranslator = new TencentTranslator();
export default tencentTranslator;
