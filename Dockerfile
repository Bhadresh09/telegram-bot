FROM node:18-slim

RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install --upgrade yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "index.js"]
