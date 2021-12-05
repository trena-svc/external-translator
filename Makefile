.PHONY: deploy

deploy:
	docker stack deploy -c ./deploy/docker-compose.yml trena

build-puppeteer:
	docker build -f ./puppeteer.Dockerfile -t puppeteer-chrome-linux ./

build-external-translator:
	docker build -f ./Dockerfile -t trena-external-translator ./
