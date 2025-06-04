all: up

up:
	make -C ./backend

clean:
	make clean -C ./backend

down: clean

dev: clean
	make dev -C ./backend

re: clean dev

django:
	docker container exec -it backend-django-1 bash

nginx:
	docker container exec -it backend-nginx-1 bash

.PHONY: all clean dev re down django nginx
