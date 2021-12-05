import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = getConfig(app.get(ConfigService), 'port');
  await app.listen(port);
}

bootstrap();
