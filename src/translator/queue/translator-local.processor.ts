import { HttpService } from '@nestjs/axios';
import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { firstValueFrom } from 'rxjs';
import format from 'string-template';
import { getConfig } from '../../config/configuration';
import { TranslationTaskManager } from '../translation-task-manager';
import {
  createIsCancelledOrFailedFunction,
  TranslationQueueJobRequest,
  TranslationQueueJobResponse,
} from './queue-job';

const sleep = (time: number) =>
  new Promise((res, rej) => {
    setTimeout(() => res(time), time);
  });

@Processor('local')
export class TranslatorLocalProcessor {
  private readonly logger = new Logger(TranslatorLocalProcessor.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Process({ concurrency: 5 })
  async handleTranslation(
    job: Job<TranslationQueueJobRequest>,
  ): Promise<TranslationQueueJobResponse | undefined> {
    const workerConfig = getConfig(this.configService, 'translationWorker');

    const { srcLang, trgLang, inputTextList, engineType, meta, ...ext } =
      job.data;
    const startTime = Date.now();

    this.logger.log(
      `Received new job ${job.id}: ${srcLang}2${trgLang}, engine: ${engineType}`,
    );

    const isCancelledOrFailed = createIsCancelledOrFailedFunction(
      job,
      workerConfig.countUnitToCheckFailed,
    );

    const taskManager = new TranslationTaskManager(inputTextList, (progress) =>
      job.progress(progress),
    );

    while (!taskManager.isFinishedAll()) {
      const isFailed = await isCancelledOrFailed();
      if (isFailed) {
        this.logger.error(`[Cancelled] Job: ${job.id}`);
        await job.remove();
        return;
      }

      const curTask = taskManager.getUnfinishedTask();
      const result = await firstValueFrom(
        this.httpService.request({
          method: meta.method,
          url: meta.apiUrl,
          headers: {
            'Content-Type': meta.contentType,
          },
          data: format(meta.bodyTemplate, {
            srcLang: srcLang,
            tgtLang: trgLang,
            srcText: curTask.text,
          }),
          insecureHTTPParser: true,
        }),
      );

      taskManager.saveTaskResult(curTask, result.data[meta.resultKey]);
    }

    const resultList = taskManager.getResultList();

    this.logger.log(
      `Finished new job ${job.id}: ${srcLang}2${trgLang}, engine: ${engineType}`,
    );

    const totalCostTime = Date.now() - startTime;
    const avgCostTime = totalCostTime / inputTextList.length;

    return {
      ...ext,
      costTimeList: [...Array(inputTextList.length)].map(() => avgCostTime),
      srcLang,
      trgLang,
      engineType,
      inputTextList,
      outputTextList: resultList,
      totalCostTime,
    };
  }

  @OnQueueCompleted()
  handleJobCompleted(job: Job, result: TranslationQueueJobResponse) {
    this.logger.log(`Job ${job.id} finished. Result: ${result.outputTextList}`);
  }
}
