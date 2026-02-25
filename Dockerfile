# ─── Stage 1: 构建前端静态资产 ────────────────────────────────────────────
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ─── Stage 2: Nginx 托管前端 + 反代后端 ────────────────────────────────────
FROM nginx:1.25-alpine AS web
COPY --from=frontend-builder /app/dist/frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx", "-g", "daemon off;"]
