FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1

COPY ./requirements.txt /tmp/requirements.txt

COPY ./app /app

WORKDIR /app

EXPOSE 8000

RUN	apt-get update && apt-get upgrade -y && apt-get install -y postgresql-client tree curl lsof && \
	python -m venv /venv && \
	/venv/bin/pip install --upgrade pip && /venv/bin/pip install --no-cache-dir -r /tmp/requirements.txt && \
	rm -rf /tmp/requirements.txt && \
	adduser --disabled-password --no-create-home django-user && \
	mkdir -p /vol/web/media && \
	mkdir -p /vol/web/static && \
	chown -R django-user:django-user /vol && \
	chmod -R 755 /vol

ENV PATH="/venv/bin:$PATH"
