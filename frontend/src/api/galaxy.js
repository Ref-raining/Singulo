/**
 * 前端 API 封装
 * 所有请求指向后端 Express 服务（开发期由 Vite proxy 转发）
 */

const BASE = '/api'

/** 大爆炸：生成初始兴趣星系节点 */
export async function generateGalaxy(topic, history = []) {
  const res = await fetch(`${BASE}/galaxy/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, history }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json() // { nodes: Node[] }
}

/** 点击节点：懒加载子节点 */
export async function expandNode(nodeId, topic, parentContext, history = []) {
  const res = await fetch(`${BASE}/galaxy/expand`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodeId, topic, parentContext, history }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json() // { children: Node[] }
}

/** 虫洞：生成跨界联想新星系 */
export async function wormhole(currentTopic, history = []) {
  const res = await fetch(`${BASE}/galaxy/wormhole`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentTopic, history }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json() // { topic: string, nodes: Node[] }
}
