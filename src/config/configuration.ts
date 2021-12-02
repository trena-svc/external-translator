import { ConfigService } from '@nestjs/config';

const createConfiguration = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  translationWorker: {
    parallelism: parseInt(process.env.BULL_TRANSLATION_RUNNER_PARALLELISM),
    headless: process.env.BULL_TRANSLATION_RUNNER_HEADLESS === 'true',
    useProxy: process.env.BULL_TRANSLATION_RUNNER_USE_PROXY === 'true',
  },
});

export type Configuration = ReturnType<typeof createConfiguration>;

export const getConfig = <T extends keyof Configuration>(
  configService: ConfigService,
  key: T,
) => {
  return configService.get<Configuration[T]>(key);
};

export default createConfiguration;
