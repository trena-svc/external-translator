import { Injectable, Logger } from '@nestjs/common';
import { TranslatorRunnerFactoryService } from './translator-runner-factory.service';
import { Language, TranslatorEngineType } from '../translator';
import { TranslationTaskManager } from '../translation-task-manager';

type TranslateParams = {
  engineType: TranslatorEngineType;
  srcLang: Language;
  tgtLang: Language;
  srcTextList: string[];
};

type TranslateMetaParams = {
  logPrefix?: string;
  parallelism?: number;
  proxyList: string[];
  onProgressUpdate: (progress: number) => Promise<void>;
  isCancelledOrFailed?: () => Promise<boolean>;
  headless?: boolean;
  useProxy?: boolean;
};

@Injectable()
export class TranslatorService {
  private readonly logger = new Logger(TranslatorService.name);

  constructor(
    private translatorRunnerFactoryService: TranslatorRunnerFactoryService,
  ) {}

  async translate(
    { srcLang, tgtLang, srcTextList, engineType }: TranslateParams,
    {
      logPrefix,
      proxyList,
      onProgressUpdate,
      parallelism = 1,
      headless = true,
      useProxy = true,
      isCancelledOrFailed = () => Promise.resolve(false),
    }: TranslateMetaParams,
  ): Promise<string[]> {
    const taskManager = new TranslationTaskManager(
      srcTextList,
      onProgressUpdate,
    );

    this.logger.log(
      `Direction: ${srcLang}2${tgtLang}, Translator: ${engineType}, Length: ${srcTextList.length}`,
    );

    const runnerList = [...Array(parallelism)].map(() =>
      this.translatorRunnerFactoryService.create({
        srcLang,
        tgtLang,
        proxyList,
        headless,
        useProxy,
        engineType,
      }),
    );

    try {
      await Promise.race(
        runnerList.map(async (runner, runnerIdx) => {
          const logRunner = this.createRunnerLogger(runnerIdx, logPrefix);
          while (
            !taskManager.isFinishedAll() &&
            !(await isCancelledOrFailed())
          ) {
            const curTask = taskManager.getUnfinishedTask();
            if (!curTask) {
              break;
            }

            try {
              await runner.prepare();
              logRunner(
                `Start to translate at order [${curTask.order}/${srcTextList.length}]`,
              );

              const [result] = await runner.run([curTask.text]);

              logRunner(
                `Finish to translate at order [${curTask.order}/${srcTextList.length}]`,
              );

              await taskManager.saveTaskResult(curTask, result);
            } catch (err) {
              if (!taskManager.isFinishedAll()) {
                logRunner(
                  `Failed to translate ${curTask.text}, ${
                    (err as Error).stack
                  }`,
                  'error',
                );
              }

              await runner.close();
            }
          }
        }),
      );
    } catch (err) {
      await Promise.all(runnerList.map((x) => x.close()));
    } finally {
      await Promise.all(runnerList.map((x) => x.close()));
    }

    return taskManager.getResultList();
  }

  private createRunnerLogger(runnerIdx: number, extraPrefix = '') {
    const prefix = `Runner ${runnerIdx}`;

    return (log: string, level: 'info' | 'error' = 'info') => {
      if (level === 'info') {
        this.logger.log(`${extraPrefix}, ${prefix}: ${log}`);
      } else {
        this.logger.error(`${extraPrefix}, ${prefix}: ${log}`);
      }
    };
  }
}
