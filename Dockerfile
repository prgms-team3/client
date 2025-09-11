FROM node:20-alpine AS builder

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

#===================#

FROM node:20-alpin
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production


COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public


RUN addgroup -S appgroup && adduser -S appuser -G appgroup

RUN chown -R appuser:appgroup /usr/src/app

USER appuser

ENV NODE_ENV=production

CMD ["npm", "start"]