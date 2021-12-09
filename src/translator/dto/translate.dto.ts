import { Language, TranslatorEngineType } from '../translator';

export class TranslateDto {
  srcLang: Language;
  tgtLang: Language;
  srcTextList: string[];
  engineType: TranslatorEngineType;
  headless?: boolean;
  useProxy?: boolean;
  proxyServer?: string;
  parallelism?: number;
}

export class TranslateJobSubmitDto {
  srcLang: Language;
  tgtLang: Language;
  srcTextList: string[];
  engineType: TranslatorEngineType;
}
