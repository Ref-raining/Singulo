#!/bin/bash
# Singulo K8s 本地一键部署脚本
# 适用于：minikube / kind / Docker Desktop K8s
set -e

echo "==> [1/5] 构建前端镜像（含 Nginx）..."
docker build -t singulo-web:latest -f Dockerfile --target web .

echo "==> [2/5] 构建后端镜像..."
docker build -t singulo-backend:latest -f backend/Dockerfile ./backend

echo "==> [3/5] 加载镜像到集群（minikube 模式）..."
# 如果使用 kind，替换为: kind load docker-image singulo-web:latest
# 如果使用 Docker Desktop K8s，本地镜像直接可用，跳过此步
if command -v minikube &> /dev/null; then
  minikube image load singulo-web:latest
  minikube image load singulo-backend:latest
fi

echo "==> [4/5] 应用 K8s 资源..."
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

echo "==> [5/5] 等待 Pod 就绪..."
kubectl rollout status deployment/singulo-backend --timeout=60s
kubectl rollout status deployment/singulo-web --timeout=60s

echo ""
echo "✅ 部署完成！"
echo ""
echo "访问方式："
echo "  - NodePort: http://localhost:30080"
if command -v minikube &> /dev/null; then
  echo "  - minikube:  $(minikube service singulo-web --url 2>/dev/null || echo '运行 minikube service singulo-web 获取地址')"
fi
echo ""
echo "Pod 状态："
kubectl get pods -l 'app in (singulo-web, singulo-backend)'
