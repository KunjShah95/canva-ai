FROM node:20-alpine AS base
WORKDIR /app

RUN apk upgrade --no-cache

COPY package*.json ./
RUN npm ci --omit=dev --omit=optional ; npm cache clean --force

COPY . .

RUN chown -R node:node /app
USER node

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
