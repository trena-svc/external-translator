import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TranslatorModule } from './translator/translator.module';

@Module({
  imports: [TranslatorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
