FROM owasp/modsecurity-crs:4.11.0-nginx-202502270602

USER root

RUN apt update && apt install -y vim curl

RUN mkdir -p /var/log/modsecurity && touch /var/log/modsecurity/modsec_audit.log

COPY ./certs/cert.pem /etc/nginx/certs/cert.pem
COPY ./certs/key.pem /etc/nginx/certs/key.pem

COPY ./conf.d/nginx.conf /etc/nginx/templates/nginx.conf.template
COPY ./conf.d/default.conf /etc/nginx/templates/conf.d/default.conf.template
COPY ./conf.d/proxy_backend.conf /etc/nginx/templates/includes/proxy_backend.conf.template
COPY ./conf.d/cors.conf /etc/nginx/templates/includes/cors.conf.template

COPY ./conf.d/crs-setup.conf /etc/modsecurity.d/owasp-crs/crs-setup.conf
COPY ./conf.d/modsecurity-override.conf /etc/nginx/templates/modsecurity.d/modsecurity-override.conf.template
