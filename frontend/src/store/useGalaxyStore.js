/**
 * Zustand 全局状态管理
 * 管理星系节点树、UI 状态（爆炸阶段、抽屉开关）、LocalStorage 记忆
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

// ── 持久化：用户探索历史存入 LocalStorage ──────────────────────────────────
const MEMORY_KEY = 'singulo_memory'

export const useGalaxyStore = create(
  persist(
    (set, get) => ({
      // ── Phase ─────────────────────────────────────────────────────────────
      phase: 'input',          // 'input' | 'charging' | 'exploding' | 'galaxy'
      rootTopic: '',

      // ── 节点树 ────────────────────────────────────────────────────────────
      nodes: [],               // Node[]
      selectedNodeId: null,
      drawerOpen: false,

      // ── 双生记忆（持久化）────────────────────────────────────────────────
      explorationHistory: [],  // [{ topic, timestamp }]

      // ── Actions ───────────────────────────────────────────────────────────
      setPhase: (phase) => set({ phase }),

      setRootTopic: (topic) => set({ rootTopic: topic }),

      /** 设置从后端返回的顶层节点列表（大爆炸后） */
      setNodes: (nodes) => set({ nodes }),

      /** 追加子节点到父节点下 */
      appendChildren: (parentId, children) =>
        set((state) => {
          // 更新父节点 status
          const updated = state.nodes.map((n) =>
            n.id === parentId ? { ...n, status: 'active' } : n
          )
          return { nodes: [...updated, ...children] }
        }),

      /** 选中节点，打开抽屉 */
      selectNode: (id) => set({ selectedNodeId: id, drawerOpen: true }),

      closeDrawer: () => set({ drawerOpen: false, selectedNodeId: null }),

      /** 记录本次探索主题到 LocalStorage */
      recordExploration: (topic) =>
        set((state) => ({
          explorationHistory: [
            { topic, timestamp: Date.now() },
            ...state.explorationHistory.slice(0, 49), // 最多保留 50 条
          ],
        })),

      /** 重置到初始状态（虫洞跃迁 / 返回首页） */
      reset: () =>
        set({
          phase: 'input',
          rootTopic: '',
          nodes: [],
          selectedNodeId: null,
          drawerOpen: false,
        }),
    }),
    {
      name: MEMORY_KEY,
      partialize: (state) => ({ explorationHistory: state.explorationHistory }),
    }
  )
)
