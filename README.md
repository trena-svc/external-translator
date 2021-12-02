# Trena External Translator

This is a translator server implementation for Trena to translate the text using various translator engines.

## Requirements

- Redis
    - It handles heavy task using queue supported by [bull.js](https://github.com/OptimalBits/bull) backed by redis
    - To develop the system, please use this [docker-compose file](./docker-compose-dev.yml)

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
- `BULL_TRANSLATION_RUNNER_PROXY_LIST_FILE_PATH`
    - File path to get a list of proxy address. The server will read the file and register a list of proxy to the
      configuration
- `BULL_TRANSLATION_RUNNER_COUNT_UNIT_TO_CHECK_FAILED`
    - Translation runner will check whether the current job is cancelled or failed because it will try to run until all
      translation task is finished
    - Default: 10
- `BULL_TRANSLATION_CONCURRENCY`
    - The number of bull consumer to be active concurrently
    - Default: 10
