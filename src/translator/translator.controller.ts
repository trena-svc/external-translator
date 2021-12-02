import { Body, Controller, Logger, Post } from '@nestjs/common';
import { TranslatorService } from './service/translator.service';
import { TranslateDto, TranslateJobSubmitDto } from './dto/translate.dto';
import { TranslatorJobSubmissionService } from './service/translator-job-submission.service';

@Controller('translate')
export class TranslatorController {
  private readonly logger = new Logger(TranslatorController.name);

  constructor(
    private readonly translatorService: TranslatorService,
    private readonly translatorJobSubmissionService: TranslatorJobSubmissionService,
  ) {}

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
      parallelism,
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
        parallelism,
        onProgressUpdate: async (progress) =>
          this.logger.log(
            `${engineType}, ${srcLang}2${tgtLang}: ${progress}% `,
          ),
        proxyList: [],
      },
    );
  }

  @Post('/submit')
  async translateTaskSubmit(
    @Body()
    { srcLang, tgtLang, srcTextList, engineType }: TranslateJobSubmitDto,
  ) {
    return await this.translatorJobSubmissionService.addJob({
      srcLang,
      tgtLang,
      srcTextList,
      engineType,
    });
  }
}
