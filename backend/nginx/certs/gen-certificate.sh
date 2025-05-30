#!/bin/sh

rm -rf ./cert.pem ./key.pem
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -batch -subj '/CN=localhost' -addext 'subjectAltName=DNS:localhost,IP:127.0.0.1'
