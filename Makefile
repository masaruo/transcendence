all:
	docker compose -f ./backend build
	docker compose -f ./frontend build
