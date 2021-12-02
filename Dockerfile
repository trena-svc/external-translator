FROM puppeteer-chrome-linux:latest

USER root

WORKDIR /usr/local/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build
RUN ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone

CMD ["yarn", "start:prod"]
