import { Body, Controller, Logger, Post } from '@nestjs/common';
import { TranslatorService } from './translator.service';
import { TranslateDto } from './dto/translate.dto';

@Controller('translate')
export class TranslatorController {
  private readonly logger = new Logger(TranslatorController.name);

  constructor(private readonly translatorService: TranslatorService) {}

  @Post()
  translate(
    @Body()
    {
      srcLang,
      tgtLang,
      srcTextList,
      engineType,
      headless,
      useProxy,
    }: TranslateDto,
  ): Promise<string[]> {
    return this.translatorService.translate(
      {
        srcLang,
        tgtLang,
        srcTextList,
        engineType,
      },
      {
        headless,
        useProxy,
        onProgressUpdate: async (progress) =>
          this.logger.log(
            `${engineType}, ${srcLang}2${tgtLang}: ${progress}% `,
          ),
        proxyList: [],
      },
    );
  }
}
