import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Language, TranslatorEngineType } from '../translator';
import { TranslationQueueJobRequest } from '../queue/queue-job';

type TranslatorAddJobParams = {
  engineType: TranslatorEngineType;
  srcLang: Language;
  tgtLang: Language;
  srcTextList: string[];
};

type TranslatorAddJobResult = {
  jobId: number | string;
  jobName: string;
};

@Injectable()
export class TranslatorJobSubmissionService {
  constructor(@InjectQueue('remote') private translationQueue: Queue) {}

  async addJob({
    srcLang,
    tgtLang,
    srcTextList,
    engineType,
  }: TranslatorAddJobParams): Promise<TranslatorAddJobResult> {
    const request: TranslationQueueJobRequest = {
      engineName: engineType,
      engineType: engineType,
      srcLang,
      trgLang: tgtLang,
      inputTextList: srcTextList,
      url: '',
      refTextList: srcTextList,
      taskId: 'task-id',
      testCaseId: 'testcase-id',
      meta: {
        apiUrl: '',
        bodyTemplate: '',
        contentType: '',
        method: 'POST',
        resultKey: '',
      },
    };

    const job = await this.translationQueue.add(request);

    return {
      jobId: job.id,
      jobName: job.name,
    };
  }
}
