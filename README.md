# Singulo — 宇宙知识探索引擎

<div align="center">

**空间化 · 主动化 · 双生 AI**

一个将信息获取转化为 3D 宇宙探索的知识引擎

</div>

---

## 🌌 项目愿景

Singulo 不是传统的 2D 瀑布流资讯平台，而是一个将知识呈现为 **3D 星系** 的探索引擎：

- 🎯 **奇点爆炸**：输入兴趣词，长按蓄力，全屏粒子爆炸生成知识拓扑图
- 🤖 **双生 Agent**：后台 AI 记忆你的探索路径，80% 迎合兴趣 + 20% 强制跨界
- 🌳 **动态生长**：点击节点触发懒加载，知识树像星系一样向四周扩展
- 🌀 **虫洞跃迁**：一键生成底层逻辑相关但表面截然不同的全新星系

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | React 18 + Vite 5 | 快速热更新，组件化 UI |
| **3D 渲染** | React Three Fiber + Three.js | 声明式 WebGL，粒子特效与节点渲染 |
| **力导向布局** | d3-force-3d | 3D 空间防重叠与自然分布 |
| **动画引擎** | GSAP 3 | 爆炸、飞行、缩放等时序动画 |
| **状态管理** | Zustand (持久化) | 全局状态 + LocalStorage 记忆 |
| **后端服务** | Node.js + Express | RESTful API，LLM 调度编排 |
| **AI 集成** | OpenAI SDK (兼容接口) | 支持 OpenAI / DeepSeek / 其他 |
| **云原生** | Docker + Compose + Nginx | 多阶段构建，前后端分离部署 |

## 📁 项目结构

```
Singulo/
├── frontend/               # Vite + React 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── three/     # R3F 三维组件（场景、节点、粒子）
│   │   │   └── ui/        # 2D UI 层（输入框、抽屉、按钮）
│   │   ├── store/         # Zustand 状态管理
│   │   ├── api/           # 后端 API 封装
│   │   └── App.jsx        # 根组件
│   └── package.json
├── backend/               # Node.js + Express 后端
│   ├── src/
│   │   ├── routes/        # API 路由（galaxy）
│   │   ├── llm.js         # LLM 客户端封装
│   │   ├── prompts.js     # Prompt 模板库
│   │   └── index.js       # 入口
│   ├── .env.example       # 环境变量模板
│   └── Dockerfile
├── reference/             # 原型参考（静态 HTML）
├── docker-compose.yml     # 编排前后端 + Nginx
├── Dockerfile             # 前端多阶段构建
├── nginx.conf             # Nginx 反向代理配置
└── package.json           # Monorepo 根配置
```

## 🚀 快速开始

### 本地开发（推荐）

**前置要求**：Node.js 22+、npm 11+

1. **安装依赖**
   ```bash
   npm install
   ```

2. **配置后端环境变量**（可选，未配置则使用 Mock 数据）
   ```bash
   cp backend/.env.example backend/.env
   # 编辑 backend/.env 填入 OPENAI_API_KEY
   ```

3. **启动前后端**
   ```bash
   npm run dev
   ```
   - 前端：http://localhost:3000
   - 后端：http://localhost:4000

4. **体验流程**
   - 输入兴趣词（如「赛博朋克」）
   - 长按屏幕中央奇点或 Space 键蓄力
   - 松开触发粒子爆炸，生成 3D 星系
   - 点击节点查看详情，右下角虫洞按钮跃迁

### Docker Compose 部署

**前置要求**：Docker + Docker Compose

```bash
# 构建并启动（生产模式）
docker compose up -d --build

# 访问
open http://localhost:8080

# 查看日志
docker compose logs -f

# 停止
docker compose down
```

### Kubernetes 部署（可选）

```bash
# 构建镜像
docker build -t singulo-web:latest .
docker build -t singulo-backend:latest -f backend/Dockerfile backend/

# 推送到镜像仓库（替换为你的仓库地址）
# docker tag singulo-web:latest <your-registry>/singulo-web:latest
# docker push <your-registry>/singulo-web:latest

# 应用 K8s 清单
kubectl apply -f k8s/

# 端口转发访问
kubectl port-forward svc/singulo-web 8080:80
```

## 🧪 开发指南

### Mock 模式 vs LLM 模式

- **Mock 模式**（默认）：`backend/.env` 未配置或 `OPENAI_API_KEY=placeholder`，返回预设的丰富示例数据
- **LLM 模式**：配置有效的 API Key 后，后端调用真实 LLM 生成个性化内容

### 前端关键组件

| 组件 | 职责 |
|------|------|
| `SingularityInput` | 初始输入界面，蓄力交互 |
| `Scene` | R3F 主场景，集成 OrbitControls + Stars |
| `BigBangParticles` | 爆炸粒子特效（GSAP 驱动） |
| `GalaxyNodes` | d3-force-3d 布局 + 节点渲染 + 懒加载 |
| `NodeDrawer` | 右侧抽屉，Markdown 内容展示 |
| `WormholeButton` | 虫洞跃迁按钮 |

### 后端 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/galaxy/generate` | POST | 生成初始星系（8-12 节点） |
| `/api/galaxy/expand` | POST | 展开子节点（3-5 节点） |
| `/api/galaxy/wormhole` | POST | 虫洞跃迁至新星系 |
| `/health` | GET | 健康检查 |

### 数据结构

节点 JSON Schema：
```typescript
interface Node {
  id: string              // UUID
  parent_id: string | null
  topic: string           // 核心词（5 字以内）
  summary: string         // 30 字悬停摘要
  content: string         // Markdown 正文
  status: 'active' | 'exploring' | 'frozen'
  media_type: 'text'      // 为后续多模态预留
}
```

## 📋 MVP 阶段约束（14 天冲刺）

为保证快速上线，当前版本严格遵守：

1. ✅ **固定视角**：使用 OrbitControls 限制在主视角旋转，不做全自由漫游
2. ✅ **纯文本输出**：所有内容统一为 Markdown，暂不接入 3D 模型/视频生成
3. ✅ **LocalStorage 记忆**：用户画像存浏览器本地，暂不接云端数据库
4. ✅ **Mock 优先**：未配置 LLM 时返回丰富示例，方便前端开发调试

## 🔮 后续规划

- [ ] 接入多模态 LLM（图片/视频/3D 模型生成）
- [ ] 云端用户画像同步（Firebase / Supabase）
- [ ] 节点间动态连线动画（贝塞尔曲线飞行）
- [ ] 语音输入 + TTS 朗读
- [ ] 移动端适配（触摸手势优化）
- [ ] PWA 离线支持
- [ ] 分享星系快照（PNG/GIF 导出）

## 📄 许可证

MIT

---

<div align="center">

**Built with ❤️ for knowledge explorers**

[问题反馈](https://github.com/Ref-raining/Singulo/issues) · [参与贡献](CONTRIBUTING.md)

</div>
