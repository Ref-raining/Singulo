/**
 * NodeDrawer — 右侧抽屉，展示节点 Markdown 内容
 */
import ReactMarkdown from 'react-markdown'
import { useGalaxyStore } from '../../store/useGalaxyStore'

export default function NodeDrawer() {
  const { nodes, selectedNodeId, drawerOpen, closeDrawer } = useGalaxyStore()
  const node = nodes.find((n) => n.id === selectedNodeId)

  if (!drawerOpen || !node) return null

  return (
    <div style={styles.overlay} onClick={closeDrawer}>
      <aside style={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <button style={styles.close} onClick={closeDrawer}>✕</button>
        <h2 style={styles.title}>{node.topic}</h2>
        <p style={styles.summary}>{node.summary}</p>
        <hr style={styles.divider} />
        <div style={styles.content}>
          <ReactMarkdown>{node.content || '*内容生成中…*'}</ReactMarkdown>
        </div>
      </aside>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 50,
    background: 'rgba(0,0,0,0.3)',
  },
  drawer: {
    position: 'absolute', top: 0, right: 0,
    width: 380, height: '100%',
    background: '#0a0a0f',
    borderLeft: '1px solid #222',
    padding: '2rem 1.5rem',
    overflowY: 'auto',
    color: '#ddd',
    fontFamily: "'Segoe UI', sans-serif",
  },
  close: {
    position: 'absolute', top: 16, right: 16,
    background: 'none', border: 'none',
    color: '#888', fontSize: '1.2rem', cursor: 'pointer',
  },
  title: {
    color: '#0ff', fontSize: '1.4rem',
    marginBottom: '0.5rem', letterSpacing: 2,
  },
  summary: {
    color: '#888', fontSize: '0.9rem',
    marginBottom: '1rem', lineHeight: 1.6,
  },
  divider: { border: 'none', borderTop: '1px solid #222', margin: '1rem 0' },
  content: {
    fontSize: '0.9rem', lineHeight: 1.8, color: '#ccc',
  },
}
