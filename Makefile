deploy:
	docker stack deploy -c docker-compose.yml trena

build-puppeteer:
	docker build -f ./puppeteer.Dockerfile -t puppeteer-chrome-linux ./

build-crawler:
	docker build -f ./Dockerfile -t trena-remote-worker ./
