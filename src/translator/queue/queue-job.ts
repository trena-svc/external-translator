import { Job } from 'bull';
import { Language, TranslatorEngineType } from '../translator';

export type EngineContentMeta = {
  contentType: string;
  apiUrl: string;
  method: 'POST' | 'GET' | 'PUT';
  bodyTemplate: string;
  resultKey: string;
};

export type TranslationQueueJobRequest = {
  testCaseId?: string;
  taskId: string;
  engineType: TranslatorEngineType;
  trgLang: Language;
  srcLang: Language;
  url: string;
  refTextList: string[];
  engineName: string;
  inputTextList: string[];
  meta: EngineContentMeta;
};

export type TranslationQueueJobResponse = {
  taskId: string;
  engineName: string;
  engineType: TranslatorEngineType;
  srcLang: Language;
  trgLang: Language;
  costTimeList: number[];
  inputTextList: string[];
  testCaseId?: string;
  totalCostTime: number;
  outputTextList: string[];
  refTextList: string[];
};

export const createIsCancelledOrFailedFunction = (
  job: Job,
  countUnitToCheckFailed = 10,
) => {
  const counterSet = {
    counter: 0,
  };
  return async () => {
    if (
      counterSet.counter === 0 ||
      counterSet.counter % countUnitToCheckFailed === 0
    ) {
      if (await job.isFailed()) {
        return true;
      }
    }
    counterSet.counter += 1;
    return false;
  };
};
