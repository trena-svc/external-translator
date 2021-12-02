import { Language, TranslatorEngineType } from '../translator';

export class TranslateDto {
  srcLang: Language;
  tgtLang: Language;
  srcTextList: string[];
  engineType: TranslatorEngineType;
  headless?: boolean;
  useProxy?: boolean;
  parallelism?: number;
}

export class TranslateJobSubmitDto {
  srcLang: Language;
  tgtLang: Language;
  srcTextList: string[];
  engineType: TranslatorEngineType;
}
