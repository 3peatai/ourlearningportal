import { useNavigate, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon'
import { BB } from '../../lib/bb'

interface Tab { key: string; path: string; icon: string; label: string }

export default function BottomNav({ tabs, accent = BB.coral }: { tabs: Tab[]; accent?: string }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div
      className="fixed bottom-3 left-3 right-3 z-50"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
        background: 'rgba(255,255,255,.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,.7)',
        borderRadius: 22,
        padding: 8,
        boxShadow: '0 12px 32px rgba(40,30,10,.12)',
      }}
    >
      {tabs.map(t => {
        const active = location.pathname === t.path || location.pathname.startsWith(t.path + '/')
        return (
          <button
            key={t.key}
            onClick={() => navigate(t.path)}
            className="flex flex-col items-center gap-0.5 py-1.5 border-none bg-transparent cursor-pointer"
          >
            <Icon name={t.icon} size={20} color={active ? accent : BB.inkMute} />
            <div style={{ fontSize: 10, fontWeight: 700, color: active ? accent : BB.inkMute }}>
              {t.label}
            </div>
            {active && (
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent, marginTop: 1 }} />
            )}
          </button>
        )
      })}
    </div>
  )
}
