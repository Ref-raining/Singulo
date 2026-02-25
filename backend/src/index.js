/**
 * Singulo 后端入口
 * Express + 路由挂载
 */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import galaxyRouter from './routes/galaxy.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// 健康检查
app.get('/health', (_, res) => res.json({ status: 'ok' }))

// 星系相关路由
app.use('/api/galaxy', galaxyRouter)

app.listen(PORT, () => {
  console.log(`[Singulo Backend] listening on http://localhost:${PORT}`)
})
