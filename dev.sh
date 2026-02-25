#!/bin/bash
# Singulo 本地开发一键启动脚本

set -e

echo "🌌 Singulo 开发环境启动中..."

# 检查依赖
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js 22+"
    exit 1
fi

# 安装依赖（若未安装）
if [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动后端
echo "🚀 启动后端服务（Mock 模式，端口 4000）..."
cd backend
if [ ! -f ".env" ]; then
    echo "⚠️  未检测到 .env，使用 Mock 模式（后端将返回示例数据）"
fi
node src/index.js &
BACKEND_PID=$!
cd ..

# 等待后端就绪
sleep 2

# 启动前端
echo "🎨 启动前端开发服务器（端口 3000）..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 启动完成！"
echo ""
echo "📍 访问地址："
echo "   前端：http://localhost:3000"
echo "   后端：http://localhost:4000"
echo ""
echo "💡 提示："
echo "   - 输入兴趣词，长按奇点或 Space 键蓄力"
echo "   - 点击节点展开，右下角虫洞跃迁"
echo "   - 后端 Mock 模式返回示例数据"
echo ""
echo "🛑 按 Ctrl+C 停止服务"
echo ""

# 捕获中断信号，优雅关闭
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

# 保持脚本运行
wait
