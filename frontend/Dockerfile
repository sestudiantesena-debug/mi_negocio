FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]