import { Injectable, Logger } from '@nestjs/common';
import {
  RunnerCreationParams,
  TranslatorRunnerFactoryService,
} from './translator-runner-factory.service';
import { Language, TranslatorEngineType } from '../translator';
import { TranslationTaskManager } from '../translation-task-manager';
import { ConfigService } from '@nestjs/config';
import { getConfig } from '../../config/configuration';
import { ProxyServerService } from './proxy-server.service';

type TranslateParams = {
  engineType: TranslatorEngineType;
  srcLang: Language;
  tgtLang: Language;
  srcTextList: string[];
};

type TranslateMetaParams = {
  logPrefix?: string;
  parallelism?: number;
  proxyServer?: string;
  useProxy?: boolean;
  onProgressUpdate: (progress: number) => Promise<void>;
  isCancelledOrFailed?: () => Promise<boolean>;
  headless?: boolean;
};

type CreateProxyCallbackParams = {
  engineType: TranslatorEngineType;
} & Pick<TranslateMetaParams, 'useProxy' | 'proxyServer'>;

type CreateProxyCallbackReturn = Pick<
  RunnerCreationParams,
  'fetchProxy' | 'updateFailedProxy'
>;

@Injectable()
export class TranslatorService {
  private readonly logger = new Logger(TranslatorService.name);

  constructor(
    private translatorRunnerFactoryService: TranslatorRunnerFactoryService,
    private proxyServerService: ProxyServerService,
    private readonly configService: ConfigService,
  ) {}

  async translate(
    { srcLang, tgtLang, srcTextList, engineType }: TranslateParams,
    {
      logPrefix,
      onProgressUpdate,
      proxyServer = getConfig(this.configService, 'translationWorker')
        .proxyServer,
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
        headless,
        engineType,
        ...this.createProxyCallback({
          useProxy,
          proxyServer,
          engineType,
        }),
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
              const isErrorInProcess = !taskManager.isFinishedAll();

              if (isErrorInProcess) {
                logRunner(
                  `Failed to translate ${curTask.text}, ${
                    (err as Error).stack
                  }`,
                  'error',
                );
              }

              await runner.close(isErrorInProcess);
            }
          }
        }),
      );
    } catch (err) {
      this.logger.error((err as Error).stack);
      await Promise.all(runnerList.map((x) => x.close()));
    } finally {
      await Promise.all(runnerList.map((x) => x.close()));
    }

    return taskManager.getResultList();
  }

  private createRunnerLogger(runnerIdx: number, extraPrefix = '') {
    const prefix = `Runner ${runnerIdx}`;
    const formattedExtraPrefix =
      extraPrefix.length === 0 ? '' : `${extraPrefix}, `;

    return (log: string, level: 'info' | 'error' = 'info') => {
      if (level === 'info') {
        this.logger.log(`${formattedExtraPrefix}${prefix}: ${log}`);
      } else {
        this.logger.error(`${formattedExtraPrefix}${prefix}: ${log}`);
      }
    };
  }

  private createProxyCallback({
    engineType,
    useProxy,
    proxyServer,
  }: CreateProxyCallbackParams): CreateProxyCallbackReturn {
    if (useProxy && proxyServer) {
      return {
        fetchProxy: () => Promise.resolve(proxyServer),
        updateFailedProxy: () => Promise.resolve(),
      };
    }

    return {
      fetchProxy: useProxy
        ? () => this.proxyServerService.getNewProxyServer(engineType)
        : undefined,
      updateFailedProxy: useProxy
        ? (proxy) =>
            this.proxyServerService.updateFailedProxyServer(engineType, proxy)
        : undefined,
    };
  }
}
