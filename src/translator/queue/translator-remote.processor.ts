import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { getConfig } from '../../config/configuration';
import { TranslatorService } from '../service/translator.service';
import {
  createIsCancelledOrFailedFunction,
  TranslationQueueJobRequest,
  TranslationQueueJobResponse,
} from './queue-job';

@Processor('remote')
export class TranslatorRemoteProcessor {
  private readonly logger = new Logger(TranslatorRemoteProcessor.name);

  constructor(
    private readonly translatorService: TranslatorService,
    private readonly configService: ConfigService,
  ) {}

  @Process({ concurrency: parseInt(process.env.BULL_TRANSLATION_CONCURRENCY) })
  async handleTranslation(
    job: Job<TranslationQueueJobRequest>,
  ): Promise<TranslationQueueJobResponse> {
    const workerConfig = getConfig(this.configService, 'translationWorker');

    const { srcLang, trgLang, inputTextList, engineType, ...ext } = job.data;
    const startTime = Date.now();

    this.logger.log(
      `Received new job ${job.id}: ${srcLang}2${trgLang}, engine: ${engineType}`,
    );

    const isCancelledOrFailed = createIsCancelledOrFailedFunction(
      job,
      workerConfig.countUnitToCheckFailed,
    );

    const result = await this.translatorService.translate(
      {
        srcLang,
        tgtLang: trgLang,
        engineType,
        srcTextList: inputTextList,
      },
      {
        headless: workerConfig.headless,
        parallelism: workerConfig.parallelism,
        proxyServer: workerConfig.proxyServer,
        onProgressUpdate: (progress) => job.progress(progress),
        isCancelledOrFailed,
        logPrefix: `JobId: ${job.id}, Engine: ${engineType}`,
      },
    );

    if (!result) {
      this.logger.error(`[Cancelled] Job: ${job.id}`);
      await job.remove();
      return;
    }

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
      outputTextList: result,
      totalCostTime,
    };
  }

  @OnQueueCompleted()
  handleJobCompleted(job: Job, result: TranslationQueueJobResponse) {
    this.logger.log(`Job ${job.id} finished. Result: ${result.outputTextList}`);
  }
}
