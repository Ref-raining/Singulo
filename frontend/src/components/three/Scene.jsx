/**
 * Scene — R3F 主场景
 * 组合：OrbitControls + 星域背景 + 大爆炸粒子 + 星系节点
 */
import { useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useGalaxyStore } from '../../store/useGalaxyStore'
import BigBangParticles from './BigBangParticles'
import GalaxyNodes from './GalaxyNodes'

export default function Scene() {
  const { phase, nodes, setPhase } = useGalaxyStore()

  const isExploding = phase === 'exploding'
  const isGalaxy = phase === 'galaxy'

  return (
    <Canvas
      style={{ position: 'fixed', inset: 0 }}
      camera={{ position: [0, 0, 200], fov: 75, near: 0.1, far: 2000 }}
      gl={{ antialias: true }}
      fog={['exp2', 0x000000, 0.003]}
    >
      {/* 光源 */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={2} distance={500} />

      {/* 星域背景 */}
      <Stars radius={600} depth={60} count={8000} factor={4} saturation={0} fade speed={0.3} />

      {/* 大爆炸粒子 */}
      <BigBangParticles
        active={isExploding}
        onComplete={() => {
          if (phase === 'exploding') setPhase('galaxy')
        }}
      />

      {/* 星系节点（仅在 galaxy 阶段渲染） */}
      <Suspense fallback={null}>
        {isGalaxy && <GalaxyNodes nodes={nodes} />}
      </Suspense>

      {/* OrbitControls：固定视角，仅旋转 */}
      <OrbitControls
        enabled={isGalaxy}
        enableZoom
        enablePan={false}
        autoRotate={isGalaxy}
        autoRotateSpeed={0.6}
        minDistance={30}
        maxDistance={500}
      />
    </Canvas>
  )
}
