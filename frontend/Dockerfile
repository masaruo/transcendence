FROM node:18.20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD npm run build && touch /app/build-complete && tail -f /dev/null
