FROM node:20-alpine AS builder
WORKDIR /usr/src/app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# =================================== #
FROM node:20-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /usr/src/app/package*.json ./
RUN npm ci --only=production
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
RUN chown -R appuser:appgroup /usr/src/app
USER appuser
CMD ["npm", "start"]