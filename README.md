# Trena External Translator

This is a translator server implementation for Trena to translate the text using various translator engines.

## Requirements

- Redis
  - It handles heavy task using queue supported by [bull.js](https://github.com/OptimalBits/bull) backed by redis
  - To develop the system, please use this [docker-compose file](./docker-compose-dev.yml)
  - In bull, it uses the specific queue named by "remote"

## Environment Variables

- `PORT`
  - Port to run the server
  - Default: 3000
- `REDIS_HOST`
  - Redis host address
  - **Required**
- `REDIS_PORT`
  - Redis port number
  - Default: 6379
- `BULL_TRANSLATION_RUNNER_PARALLELISM`
  - The number of pages to run translation concurrently
  - Default: 5
- `BULL_TRANSLATION_RUNNER_HEADLESS`
  - Whether to run translation runner headless
  - Default: true
- `BULL_TRANSLATION_RUNNER_USE_PROXY`
  - Whether to use a list of proxy to run the runner
  - Default: true
- `BULL_TRANSLATION_RUNNER_PROXY_SERVER`
  - URL of the proxy server for translator
- `BULL_TRANSLATION_RUNNER_PROXY_SERVER_MANAGER`
  - URL of the proxy server manager
  - It should include protocol
- `BULL_TRANSLATION_RUNNER_COUNT_UNIT_TO_CHECK_FAILED`
  - Translation runner will check whether the current job is cancelled or failed because it will try to run until all
    translation task is finished
  - Default: 10
- `BULL_TRANSLATION_CONCURRENCY`
  - The number of bull consumer to be active concurrently
  - Default: 10

## Deployment

In the case of using proxy server manager, it is required to initialize a list of proxy server for each translation
engine. To do it simple you can use [./deploy/init-proxy-storage.sh](./deploy/init-proxy-storage.sh).

```bash
cd ./deploy
./init-proxy-storage.sh ${SERVER_URL} google,kakao,naver,bing,baidu,sogou,tencent
```
