/**
 * GalaxyScene — R3F 主画布
 * 包含：OrbitControls、雾效、灯光、节点渲染
 */
import { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force-3d'
import GalaxyNodes from './GalaxyNodes'
import { useGalaxyStore } from '../../store/useGalaxyStore'

export default function GalaxyScene() {
  const nodes = useGalaxyStore((s) => s.nodes)

  return (
    <Canvas
      style={{ width: '100vw', height: '100vh', background: '#000' }}
      camera={{ position: [0, 0, 200], fov: 75 }}
      gl={{ antialias: true }}
      fog={['black', 50, 800]}
    >
      {/* 星空背景 */}
      <Stars radius={600} depth={60} count={5000} factor={4} saturation={0} fade />

      {/* 灯光 */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={1.5} distance={500} />

      {/* 控制器：固定视角，允许旋转 */}
      <OrbitControls
        enableZoom
        minDistance={40}
        maxDistance={450}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        dampingFactor={0.08}
        enableDamping
      />

      {/* 节点 */}
      {nodes.length > 0 && <GalaxyNodes nodes={nodes} />}
    </Canvas>
  )
}
