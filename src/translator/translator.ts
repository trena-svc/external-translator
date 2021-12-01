import { Page } from 'puppeteer';

export type TranslatorEngineType =
  | 'google'
  | 'kakao'
  | 'naver'
  | 'bing'
  | 'baidu'
  | 'sogou'
  | 'tencent';

export type Language =
  | 'de'
  | 'en'
  | 'es'
  | 'fr'
  | 'it'
  | 'ja'
  | 'ko'
  | 'pt'
  | 'vi'
  | 'zh';

export interface Translator {
  /**
   * Init the translator at the page.
   *
   * @param page page to access
   * @param srcLang language to translate from
   * @param tgtLang language to translate to
   */
  init(page: Page, srcLang: Language, tgtLang: Language): Promise<void>;

  /**
   * Translate into the text
   * @param page
   * @param srcLang language to translate from
   * @param tgtLang language to translate to
   * @param srcTextList text list to translate
   */
  translate(
    page: Page,
    srcLang: Language,
    tgtLang: Language,
    srcTextList: string[],
  ): Promise<string[]>;
}
