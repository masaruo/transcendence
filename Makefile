BACKEND := ./backend
COMPOSE := docker compose -f $(BACKEND)/docker-compose.yaml
DEV_COMPOSE := $(BACKEND)/docker-compose.debug.yaml

all: up

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down --remove-orphans

dev: down
	$(COMPOSE) -f $(DEV_COMPOSE) up --build

clean:
	$(COMPOSE) down --rmi all

fclean:
	@echo "データベースの初期化を行います"
	$(COMPOSE) down --rmi all --volumes

manage:
	@echo "usage make manage CMD=<your_command>"
	$(COMPOSE) exec django python /app/app/manage.py $(CMD)

makemigrations:
	$(COMPOSE) exec django python /app/app/manage.py makemigrations

createsuperuser:
	$(COMPOSE) exec django python /app/app/manage.py createsuperuser

django:
	$(COMPOSE) exec django bash

nginx:
	$(COMPOSE) exec nginx bash

db:
	$(COMPOSE) exec db bash

log:
	$(COMPOSE) exec nginx tail -f /var/log/modsecurity/modsec_audit.log

.PHONY: all up down dev clean fclean manage makemigrations createsuperuser django nginx db log
