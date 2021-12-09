import { Module } from '@nestjs/common';
import { TranslatorModule } from './translator/translator.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import configuration, { getConfig } from './config/configuration';
import { HealthController } from './health/health.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [
    TranslatorModule,
    TerminusModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      load: [configuration],
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),
        BULL_TRANSLATION_QUEUE_NAME: Joi.string().required(),
        BULL_TRANSLATION_RUNNER_PARALLELISM: Joi.number().default(5),
        BULL_TRANSLATION_RUNNER_HEADLESS: Joi.bool().default(true),
        BULL_TRANSLATION_RUNNER_PROXY_SERVER: Joi.string(),
        BULL_TRANSLATION_RUNNER_PROXY_SERVER_MANAGER: Joi.string(),
        BULL_TRANSLATION_RUNNER_COUNT_UNIT_TO_CHECK_FAILED:
          Joi.number().default(10),
        BULL_TRANSLATION_CONCURRENCY: Joi.number().default(10),
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = getConfig(configService, 'redis');
        return {
          redis: {
            host: redisConfig.host,
            port: redisConfig.port,
          },
        };
      },
    }),
  ],
  controllers: [HealthController],
  providers: [],
  exports: [BullModule],
})
export class AppModule {}
