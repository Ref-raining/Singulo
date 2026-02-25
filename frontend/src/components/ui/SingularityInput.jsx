/**
 * SingularityInput — 初始蓄力界面
 * 长按奇点或 Space 蓄力，松开后触发大爆炸
 */
import { useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { useGalaxyStore } from '../../store/useGalaxyStore'
import { generateGalaxy } from '../../api/galaxy'

export default function SingularityInput() {
  const [topic, setTopic] = useState('')
  const [charge, setCharge] = useState(0)
  const [hint, setHint] = useState('输入兴趣词，长按奇点蓄力')
  const [isCharging, setIsCharging] = useState(false)
  const singRef = useRef(null)
  const intervalRef = useRef(null)
  const chargeRef = useRef(0)

  const { setPhase, setRootTopic, setNodes, recordExploration, explorationHistory } =
    useGalaxyStore()

  // ── 蓄力逻辑 ──────────────────────────────────────────────────────────
  const startCharge = useCallback(
    (e) => {
      if (e?.preventDefault) e.preventDefault()
      if (isCharging || !topic.trim()) return
      setIsCharging(true)
      chargeRef.current = 0
      intervalRef.current = setInterval(() => {
        chargeRef.current = Math.min(chargeRef.current + 0.025, 1)
        setCharge(chargeRef.current)
        const scale = 1 + chargeRef.current * 3
        if (singRef.current) {
          singRef.current.style.transform = `translate(-50%,-50%) scale(${scale})`
          if (chargeRef.current < 0.4) {
            singRef.current.style.background = '#fff'
            singRef.current.style.boxShadow = `0 0 ${20 * scale}px #fff`
            setHint('长按蓄力…')
          } else if (chargeRef.current < 0.8) {
            singRef.current.style.background = '#a0f'
            singRef.current.style.boxShadow = `0 0 ${30 * scale}px #a0f`
            setHint('能量激增…')
          } else {
            singRef.current.style.background = '#f05'
            singRef.current.style.boxShadow = `0 0 ${40 * scale}px #f05`
            setHint('临界点！释放！')
          }
        }
      }, 20)
    },
    [isCharging, topic]
  )

  const stopCharge = useCallback(async () => {
    if (!isCharging) return
    clearInterval(intervalRef.current)
    setIsCharging(false)
    if (chargeRef.current >= 0.9) {
      await triggerBigBang()
    } else {
      chargeRef.current = 0
      setCharge(0)
      if (singRef.current) {
        singRef.current.style.transform = 'translate(-50%,-50%) scale(1)'
        singRef.current.style.background = '#fff'
        singRef.current.style.boxShadow = '0 0 20px #fff'
      }
      setHint('充能未满，再试一次')
    }
  }, [isCharging, topic])

  // ── 大爆炸触发 ────────────────────────────────────────────────────────
  const triggerBigBang = async () => {
    setPhase('exploding')
    setRootTopic(topic)
    recordExploration(topic)
    try {
      const { nodes } = await generateGalaxy(
        topic,
        explorationHistory.map((h) => h.topic)
      )
      setNodes(nodes)
      setPhase('galaxy')
    } catch (err) {
      console.error('generateGalaxy failed', err)
      setPhase('input')
    }
  }

  // ── Space 键盘支持 ─────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.code === 'Space' && !e.repeat) startCharge()
  }
  const handleKeyUp = (e) => {
    if (e.code === 'Space') stopCharge()
  }

  return (
    <div
      style={styles.container}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      {/* 兴趣词输入框 */}
      <input
        style={styles.input}
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="输入一个兴趣词，如「赛博朋克」"
        onKeyDown={(e) => e.stopPropagation()}
      />

      {/* 提示文字 */}
      <p style={{ ...styles.hint, color: charge > 0.8 ? '#f05' : charge > 0.4 ? '#a0f' : '#666' }}>
        {hint}
      </p>

      {/* 奇点按钮 */}
      <div
        ref={singRef}
        style={styles.singularity}
        onMouseDown={startCharge}
        onMouseUp={stopCharge}
        onTouchStart={startCharge}
        onTouchEnd={stopCharge}
      />

      {/* 充能进度条 */}
      <div style={styles.chargeBar}>
        <div style={{ ...styles.chargeFill, width: `${charge * 100}%` }} />
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    zIndex: 10,
  },
  input: {
    background: 'transparent',
    border: '1px solid #333',
    borderRadius: 4,
    color: '#fff',
    fontSize: '1rem',
    padding: '0.5rem 1rem',
    marginBottom: '2rem',
    width: 280,
    textAlign: 'center',
    outline: 'none',
  },
  hint: {
    fontSize: '0.85rem',
    letterSpacing: 2,
    marginBottom: '5rem',
    transition: 'color 0.3s',
  },
  singularity: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 0 20px #fff',
    cursor: 'pointer',
    transform: 'translate(-50%,-50%) scale(1)',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  chargeBar: {
    position: 'fixed',
    bottom: 40,
    width: 200,
    height: 3,
    background: '#111',
    borderRadius: 2,
    overflow: 'hidden',
  },
  chargeFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #0ff, #f05)',
    transition: 'width 0.05s linear',
  },
}
