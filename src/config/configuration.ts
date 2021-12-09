import { ConfigService } from '@nestjs/config';

const createConfiguration = () => {
  return {
    port: parseInt(process.env.PORT, 10) || 3000,
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    },
    translationWorker: {
      parallelism: parseInt(process.env.BULL_TRANSLATION_RUNNER_PARALLELISM),
      headless: process.env.BULL_TRANSLATION_RUNNER_HEADLESS === 'true',
      proxyServer: process.env.BULL_TRANSLATION_RUNNER_PROXY_SERVER,
      proxyServerManager:
        process.env.BULL_TRANSLATION_RUNNER_PROXY_SERVER_MANAGER,
      countUnitToCheckFailed:
        parseInt(
          process.env.BULL_TRANSLATION_RUNNER_COUNT_UNIT_TO_CHECK_FAILED,
          10,
        ) || 10,
    },
  };
};

export type Configuration = ReturnType<typeof createConfiguration>;

export const getConfig = <T extends keyof Configuration>(
  configService: ConfigService,
  key: T,
) => {
  return configService.get<Configuration[T]>(key);
};

export default createConfiguration;
