import { Injectable, Logger } from '@nestjs/common';
import { TranslatorRunnerFactoryService } from './translator-runner-factory.service';
import { Language, TranslatorEngineType } from './translator';
import { TranslationTaskManager } from './translation-task-manager';

type TranslateParams = {
  engineType: TranslatorEngineType;
  srcLang: Language;
  tgtLang: Language;
  srcTextList: string[];
};

type TranslateMetaParams = {
  parallelism?: number;
  proxyList: string[];
  onProgressUpdate: (progress: number) => Promise<void>;
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
      proxyList,
      onProgressUpdate,
      parallelism = 1,
      headless = true,
      useProxy = true,
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
          while (!taskManager.isFinishedAll()) {
            const curTask = taskManager.getUnfinishedTask();
            if (!curTask) {
              break;
            }

            try {
              this.logger.log(`Crawler ${runnerIdx}: Prepare the page`);
              await runner.prepare();
              this.logger.log(
                `Crawler ${runnerIdx}: Start to translate ${curTask.text}`,
              );

              const [result] = await runner.run([curTask.text]);

              this.logger.log(
                `Crawler ${runnerIdx}: Finish to translate ${curTask.text}`,
              );

              await taskManager.saveTaskResult(curTask, result);
            } catch (err) {
              const error = err as Error;
              this.logger.error(
                `Crawler ${runnerIdx}: Failed to translate ${error.message}`,
              );
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
}
