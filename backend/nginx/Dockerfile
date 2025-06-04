FROM nginx:1.27.5-bookworm

COPY ./certs/cert.pem /etc/nginx/certs/cert.pem
COPY ./certs/key.pem /etc/nginx/certs/key.pem
# COPY ./conf.d//nginx.conf /etc/nginx/conf.d/default.conf.template
COPY ./conf.d/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./includes /etc/nginx/includes

USER root
