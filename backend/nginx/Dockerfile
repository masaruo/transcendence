FROM owasp/modsecurity-crs:4.11.0-nginx-202502270602



COPY ./certs/cert.pem /etc/nginx/certs/cert.pem
COPY ./certs/key.pem /etc/nginx/certs/key.pem


COPY ./conf.d/nginx.conf /etc/nginx/templates/conf.d/default.conf.template
COPY ./conf.d/proxy_backend.conf /etc/nginx/templates/includes/proxy_backend.conf.template
COPY ./conf.d/cors.conf /etc/nginx/templates/includes/cors.conf.template
COPY ./conf.d/crs-setup.conf /etc/nginx/templates/modsecurity.d/setup.conf.template

USER root
