FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1

COPY ./requirements.txt /tmp/requirements.txt

COPY ./app /app

WORKDIR /app

EXPOSE 8000

RUN	apt-get update && apt-get upgrade -y && apt-get install -y postgresql-client && \
	pip install --upgrade pip && pip install --no-cache-dir -r /tmp/requirements.txt && \
	rm -rf /tmp/requirements.txt

RUN adduser --disabled-password --no-create-home django-user
