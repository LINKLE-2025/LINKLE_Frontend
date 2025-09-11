# 1단계: Build stage
FROM node:22.17.0-alpine AS build
WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 복사 및 빌드
COPY . .
RUN npm run build

# 2단계: Production stage (Nginx로 정적 파일 서빙)
FROM nginx:alpine
# React 빌드 결과를 Nginx 기본 경로에 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 커스텀 Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx 포트 노출 및 실행
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]