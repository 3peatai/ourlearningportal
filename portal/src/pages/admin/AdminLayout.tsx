import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calendar, Receipt,
  UserCheck, TrendingDown, Menu, X, LogOut, ChevronRight, BookMarked,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { R } from '../../lib/routes'

const NAV = [
  { path: R.ADMIN_DASHBOARD,  icon: LayoutDashboard, label: 'Dashboard'  },
  { path: R.ADMIN_STUDENTS,   icon: Users,            label: 'Students'   },
  { path: R.ADMIN_CALENDAR,   icon: Calendar,         label: 'Calendar'   },
  { path: R.ADMIN_PROGRAMMES, icon: BookMarked,       label: 'Programmes' },
  { path: R.ADMIN_INVOICES,   icon: Receipt,          label: 'Invoices'   },
  { path: R.ADMIN_TEACHERS,   icon: UserCheck,        label: 'Teachers'   },
  { path: R.ADMIN_EXPENSES,   icon: TrendingDown,     label: 'Expenses'   },
]

// OLP palette
const TEAL  = '#0c7872'
const PAPER = '#f4ede0'
const INK   = '#1c2a2c'

function InitialsAvatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${TEAL}, #0a4e4b)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 800, color: '#fff', flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

// OLP wordmark for the sidebar
function OLPWordmark() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="12" stroke={TEAL} strokeWidth="1.6"/>
        <circle cx="14" cy="14" r="6" fill={TEAL}/>
        <circle cx="22" cy="14" r="1.6" fill={TEAL}/>
      </svg>
      <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: -0.3, color: INK }}>Our Learning</span>
      <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 16, color: TEAL, letterSpacing: -0.2 }}>portal</span>
    </div>
  )
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate(R.LOGIN)
  }

  const sidebar = (
    <aside style={{
      width: 240, flexShrink: 0, background: '#fff',
      borderRight: `1px solid rgba(28,42,44,0.08)`,
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'relative', zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(28,42,44,0.06)' }}>
        <OLPWordmark />
        <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginTop: 4, letterSpacing: 0.5 }}>
          ADMIN PORTAL
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {NAV.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 10, marginBottom: 2,
              textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 700 : 500,
              color: isActive ? TEAL : '#4B5563',
              background: isActive ? 'rgba(12,120,114,0.08)' : 'transparent',
              transition: 'all .15s',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(28,42,44,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <InitialsAvatar name={user?.name ?? 'Admin'} size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>Administrator</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', borderRadius: 8, border: 'none', background: '#FEF2F2', color: '#DC2626', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', system-ui, sans-serif", background: PAPER, overflow: 'hidden' }}>

      {/* Desktop sidebar */}
      <div className="hidden md:flex" style={{ height: '100vh' }}>
        {sidebar}
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden" style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex' }} onClick={() => setOpen(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'relative', zIndex: 41 }} onClick={e => e.stopPropagation()}>
            {sidebar}
          </div>
        </div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Mobile top bar */}
        <div className="flex md:hidden" style={{ alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', borderBottom: '1px solid rgba(28,42,44,0.08)' }}>
          <button onClick={() => setOpen(true)} style={{ padding: 6, borderRadius: 8, border: '1px solid rgba(28,42,44,0.1)', background: 'none', cursor: 'pointer' }}>
            <Menu size={20} color="#4B5563" />
          </button>
          <OLPWordmark />
          {open && (
            <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', padding: 6, border: 'none', background: 'none', cursor: 'pointer' }}>
              <X size={20} color="#4B5563" />
            </button>
          )}
        </div>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
