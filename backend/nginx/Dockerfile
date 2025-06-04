FROM owasp/modsecurity-crs:4.11.0-nginx-202502270602



COPY ./certs/cert.pem /etc/nginx/certs/cert.pem
COPY ./certs/key.pem /etc/nginx/certs/key.pem


COPY ./conf.d/nginx.conf /etc/nginx/templates/conf.d/default.conf.template
COPY ./includes /etc/nginx/includes

USER root
