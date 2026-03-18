FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV DATA_FOLDER=/app/data

EXPOSE 3000

CMD ["node", "server.js"]
