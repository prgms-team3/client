FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# placeit-frontend 폴더의 package.json 복사
COPY package*.json ./
RUN npm ci
# placeit-frontend 폴더의 모든 파일 복사
COPY . .
RUN npm run build

#===================#

FROM node:20-alpine
WORKDIR /usr/src/app
# placeit-frontend 폴더의 package.json 복사
COPY package*.json ./
RUN npm ci --only=production

# Next.js 빌드 결과물 복사
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public

# (보안 강화) 애플리케이션을 실행할 non-root 사용자 및 그룹 생성
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# (보안 강화) 애플리케이션 파일의 소유권을 새로운 사용자로 변경
RUN chown -R appuser:appgroup /usr/src/app
# (보안 강화) non-root 사용자로 전환
USER appuser

ENV NODE_ENV=production

CMD ["npm", "start"]