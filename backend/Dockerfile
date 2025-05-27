FROM python:3.11-slim

RUN python -m venv /venv

ENV PATH="/venv/bin:${PATH}"

COPY ./requirements.txt /tmp/requirements.txt

COPY ./app /app

WORKDIR /app

RUN	apt-get update && apt-get upgrade -y && apt-get install -y postgresql-client curl && \
	/venv/bin/pip install --upgrade pip && /venv/bin/pip install --no-cache-dir -r /tmp/requirements.txt && \
	rm -rf /tmp/requirements.txt && \
	adduser --disabled-password --no-create-home django-user && \
	mkdir -p /vol/web/media && \
	mkdir -p /vol/web/static && \
	chown -R django-user:django-user /vol && \
	chmod -R 755 /vol

COPY ./app/user/default_user_photo/default_avatar.jpg /vol/web/media/default_avatar.jpg
RUN chown django-user:django-user /vol/web/media/default_avatar.jpg

USER django-user

