FROM puppeteer-chrome-linux:latest

USER root
RUN apt-get update

WORKDIR /usr/local/app
COPY . .

RUN yarn build
RUN ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone

CMD ["yarn", "start:prod"]
