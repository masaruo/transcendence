FROM python:3.11-slim

# ENV PYTHONUNBUFFERED=1

RUN python -m venv /venv

ENV PATH="/venv/bin:${PATH}"

COPY ./requirements.txt /tmp/requirements.txt

COPY ./app /app

WORKDIR /app

EXPOSE 8000 443

RUN	apt-get update && apt-get upgrade -y && apt-get install -y postgresql-client tree curl lsof make && \
	python -m venv /venv && \
	/venv/bin/pip install --upgrade pip && /venv/bin/pip install --no-cache-dir -r /tmp/requirements.txt && \
	rm -rf /tmp/requirements.txt && \
	adduser --disabled-password --no-create-home django-user && \
	mkdir -p /vol/web/media && \
	mkdir -p /vol/web/static && \
	chown -R django-user:django-user /vol && \
	chmod -R 755 /vol

# RUN adduser --disabled-password --no-create-home django-user
COPY ./default_avatar.jpeg /vol/web/media/default_avatar.jpeg

ENV PATH="/venv/bin:$PATH"
