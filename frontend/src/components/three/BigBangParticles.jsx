/**
 * BigBangParticles — 爆炸时的粒子特效层
 * 使用 Points + GSAP 实现粒子从原点向四周扩散
 */
import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gsap } from 'gsap'

const PARTICLE_COUNT = 3000

export default function BigBangParticles({ active, onComplete }) {
  const pointsRef = useRef()

  const { positions, initialPositions } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const init = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // 初始全在原点
      pos[i * 3] = pos[i * 3 + 1] = pos[i * 3 + 2] = 0
      // 目标位置：球面随机分布
      const r = 80 + Math.random() * 300
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      init[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      init[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      init[i * 3 + 2] = r * Math.cos(phi)
    }
    return { positions: pos, initialPositions: init }
  }, [])

  useEffect(() => {
    if (!active || !pointsRef.current) return
    const attr = pointsRef.current.geometry.attributes.position

    // 用 GSAP 每帧更新位置数组
    const proxy = { t: 0 }
    gsap.to(proxy, {
      t: 1,
      duration: 2.5,
      ease: 'power4.out',
      onUpdate() {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          attr.array[i * 3] = initialPositions[i * 3] * proxy.t
          attr.array[i * 3 + 1] = initialPositions[i * 3 + 1] * proxy.t
          attr.array[i * 3 + 2] = initialPositions[i * 3 + 2] * proxy.t
        }
        attr.needsUpdate = true
      },
      onComplete,
    })
  }, [active])

  if (!active) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#88ffff" size={0.8} sizeAttenuation transparent opacity={0.7} />
    </points>
  )
}
