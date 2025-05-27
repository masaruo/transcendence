all:
	docker compose up --build -d

dev:
	docker compose -f docker-compose.yaml -f docker-compose.debug.yaml up --build

re:
	docker compose down && docker compose up --build -d

clean:
	docker compose down

.PHONY: all dev re clean
