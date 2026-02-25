/**
 * App — 根组件
 * 根据 phase 渲染不同界面层
 */
import Scene from './components/three/Scene'
import SingularityInput from './components/ui/SingularityInput'
import NodeDrawer from './components/ui/NodeDrawer'
import WormholeButton from './components/ui/WormholeButton'
import { useGalaxyStore } from './store/useGalaxyStore'

export default function App() {
  const phase = useGalaxyStore((s) => s.phase)

  return (
    <>
      {/* 三维场景（始终在底层） */}
      <Scene />

      {/* 输入界面（仅初始阶段） */}
      {phase === 'input' && <SingularityInput />}

      {/* 爆炸中提示 */}
      {phase === 'exploding' && (
        <div style={{
          position: 'fixed', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: '#0ff', fontSize: '1.5rem', letterSpacing: 4,
          zIndex: 15, pointerEvents: 'none',
        }}>
          奇点爆炸中…
        </div>
      )}

      {/* 星系阶段 UI */}
      {phase === 'galaxy' && (
        <>
          <NodeDrawer />
          <WormholeButton />
        </>
      )}
    </>
  )
}
