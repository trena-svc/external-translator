import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConfig } from '../../config/configuration';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyServerService {
  private readonly logger = new Logger(ProxyServerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getNewProxyServer(target: string): Promise<string> {
    const { proxyServer, proxyServerManager } = getConfig(
      this.configService,
      'translationWorker',
    );
    if (!proxyServer && !proxyServerManager) {
      throw new Error('Proxy server or manager should be defined to use proxy');
    }

    if (proxyServer) return proxyServer;

    const res = await firstValueFrom(
      this.httpService.get<{ proxy: string }>(
        `${proxyServerManager}/proxy/random-active/${target}`,
      ),
    );

    return res.data.proxy;
  }

  async updateFailedProxyServer(target: string, proxy: string) {
    const { proxyServer, proxyServerManager } = getConfig(
      this.configService,
      'translationWorker',
    );
    if (!proxyServer && !proxyServerManager) {
      throw new Error('Proxy server or manager should be defined to use proxy');
    }

    if (proxyServer) return;

    try {
      const res = await firstValueFrom(
        this.httpService.patch<{ count: number }>(
          `${proxyServerManager}/proxy/failed/${target}`,
          {
            proxy,
          },
        ),
      );

      this.logger.log(`Proxy Server ${proxy} failed: ${res.data.count}`);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
