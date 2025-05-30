all: up

up:
	make -C ./backend

clean:
	make clean -C ./backend

down: clean

dev: clean
	make dev -C ./backend

re: clean dev

exec:
	docker container exec -it backend-django-1 bash

.PHONY: all clean dev re down
