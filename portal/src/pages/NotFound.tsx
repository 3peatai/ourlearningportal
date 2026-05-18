import { useNavigate } from 'react-router-dom'
import ClassroomBG from '../components/ui/ClassroomBG'
import { BB } from '../lib/bb'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <ClassroomBG seed={3} />
      <div style={{
        position: 'relative', zIndex: 10,
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 32, textAlign: 'center',
      }}>
        {/* Glassmorphic card */}
        <div style={{
          background: 'rgba(255,255,255,.84)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,.7)',
          borderRadius: 28,
          padding: '48px 40px',
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,.12)',
        }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: BB.ink, letterSpacing: -0.5, marginBottom: 24 }}>
            📚 <span style={{ color: BB.coral }}>Books</span>&amp;<span style={{ color: BB.teal }}>Brains</span>
          </div>

          <div style={{
            fontSize: 88, fontWeight: 900, color: BB.amber,
            lineHeight: 1, letterSpacing: -4, marginBottom: 8,
            textShadow: `2px 4px 0 ${BB.coral}44`,
          }}>
            404
          </div>

          <div style={{ fontSize: 22, fontWeight: 800, color: BB.ink, marginBottom: 10 }}>
            Page not found
          </div>
          <div style={{ fontSize: 14, color: BB.inkSoft, lineHeight: 1.6, marginBottom: 28 }}>
            Let's get you back on track. The page you're looking for doesn't exist or may have moved.
          </div>

          <button
            onClick={() => navigate('/', { replace: true })}
            style={{
              width: '100%', padding: '14px 0',
              background: `linear-gradient(135deg, ${BB.amber}, ${BB.coral})`,
              color: '#fff', border: 'none', borderRadius: 14,
              fontWeight: 800, fontSize: 15, cursor: 'pointer',
              boxShadow: `0 8px 24px ${BB.coral}44`,
            }}
          >
            Go to Home →
          </button>
        </div>
      </div>
    </div>
  )
}
