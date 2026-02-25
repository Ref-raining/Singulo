/**
 * GalaxyNodes — 用 d3-force-3d 布局并渲染节点 + 连线
 * 每个节点是一个发光球体；连线用 LineSegments 绘制
 */
import { useRef, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceZ } from 'd3-force-3d'
import { useGalaxyStore } from '../../store/useGalaxyStore'
import { expandNode } from '../../api/galaxy'

const NODE_COLORS = [0x00ffff, 0xff00ff, 0xff3300, 0x55ff00, 0xffaa00]

function pickColor(index) {
  return new THREE.Color(NODE_COLORS[index % NODE_COLORS.length])
}

export default function GalaxyNodes({ nodes }) {
  const { selectNode, appendChildren, explorationHistory } = useGalaxyStore()

  // ── D3 力导向布局（仅在 nodes 变化时重算）─────────────────────────────
  const positions = useMemo(() => {
    const simNodes = nodes.map((n) => ({ id: n.id, ...n }))
    const links = nodes
      .filter((n) => n.parent_id)
      .map((n) => ({ source: n.parent_id, target: n.id }))

    const sim = forceSimulation(simNodes, 3)
      .force('link', forceLink(links).id((d) => d.id).distance(80).strength(0.5))
      .force('charge', forceManyBody().strength(-300))
      .force('center', forceCenter(0, 0, 0))
      .force('z', forceZ(0).strength(0.05))
      .stop()

    // 静态运行足够迭代次数拿到稳定布局
    for (let i = 0; i < 200; ++i) sim.tick()

    return Object.fromEntries(simNodes.map((n) => [n.id, [n.x || 0, n.y || 0, n.z || 0]]))
  }, [nodes])

  // ── 点击节点 ──────────────────────────────────────────────────────────
  const handleClick = useCallback(
    async (node) => {
      selectNode(node.id)
      // 若尚未展开，懒加载子节点
      const hasChildren = nodes.some((n) => n.parent_id === node.id)
      if (!hasChildren && node.status !== 'frozen') {
        try {
          const { children } = await expandNode(
            node.id,
            node.topic,
            node.summary,
            explorationHistory.map((h) => h.topic)
          )
          appendChildren(node.id, children)
        } catch (err) {
          console.error('expandNode failed', err)
        }
      }
    },
    [nodes, selectNode, appendChildren, explorationHistory]
  )

  // ── 连线几何 ──────────────────────────────────────────────────────────
  const lineGeometry = useMemo(() => {
    const pts = []
    nodes.forEach((n) => {
      if (n.parent_id && positions[n.id] && positions[n.parent_id]) {
        pts.push(...positions[n.parent_id], ...positions[n.id])
      }
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [nodes, positions])

  return (
    <group>
      {/* 连线 */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#334" transparent opacity={0.5} />
      </lineSegments>

      {/* 节点球体 */}
      {nodes.map((node, i) => {
        const pos = positions[node.id] || [0, 0, 0]
        const color = pickColor(i)
        return (
          <group key={node.id} position={pos}>
            <mesh
              onClick={(e) => { e.stopPropagation(); handleClick(node) }}
              onPointerOver={() => (document.body.style.cursor = 'pointer')}
              onPointerOut={() => (document.body.style.cursor = 'default')}
            >
              <sphereGeometry args={[node.parent_id ? 3 : 6, 24, 24]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={node.status === 'exploring' ? 1.5 : 0.5}
              />
            </mesh>
            <Text
              position={[0, (node.parent_id ? 3 : 6) + 4, 0]}
              fontSize={4}
              color="#fff"
              anchorX="center"
              anchorY="bottom"
              renderOrder={1}
            >
              {node.topic}
            </Text>
          </group>
        )
      })}
    </group>
  )
}
