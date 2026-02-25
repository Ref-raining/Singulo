/**
 * WormholeButton — 右下角虫洞跃迁按钮
 * 点击后请求后端生成完全不同的新星系
 */
import { useState } from 'react'
import { useGalaxyStore } from '../../store/useGalaxyStore'
import { wormhole } from '../../api/galaxy'

export default function WormholeButton() {
  const { rootTopic, setNodes, setRootTopic, recordExploration, explorationHistory, reset, setPhase } =
    useGalaxyStore()
  const [loading, setLoading] = useState(false)

  const handleWormhole = async () => {
    setLoading(true)
    try {
      const { topic, nodes } = await wormhole(
        rootTopic,
        explorationHistory.map((h) => h.topic)
      )
      setRootTopic(topic)
      setNodes(nodes)
      recordExploration(topic)
    } catch (err) {
      console.error('wormhole failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button style={styles.btn} onClick={handleWormhole} disabled={loading}>
      {loading ? '跃迁中…' : '⟳ 虫洞跃迁'}
    </button>
  )
}

const styles = {
  btn: {
    position: 'fixed', bottom: 32, right: 32, zIndex: 20,
    background: 'rgba(0,255,255,0.08)',
    border: '1px solid #0ff',
    color: '#0ff', padding: '0.6rem 1.2rem',
    borderRadius: 4, cursor: 'pointer',
    fontSize: '0.85rem', letterSpacing: 1,
    transition: 'background 0.2s',
  },
}
