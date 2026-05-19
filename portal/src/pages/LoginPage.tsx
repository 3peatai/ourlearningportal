import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { R } from '../lib/routes'

// OLP colours
const OLP = {
  teal:  '#0c7872',
  rust:  '#b85e3a',
  aqua:  '#7fc6c0',
  paper: '#f4ede0',
  ink:   '#1c2a2c',
}

// ─── CSS-rendered portal previews ─────────────────────────────────────────────

function ParentPreview() {
  return (
    <div style={{ background: '#eef7f6', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#0a4e4b', letterSpacing: 0.5 }}>UPCOMING SESSIONS</div>
      {[
        { emoji: '🦊', prog: 'Math Explorers',     day: 'Thu 15 May', time: '10:00am', teacher: 'Beverly' },
        { emoji: '🦉', prog: 'Reading Stars',       day: 'Fri 16 May', time: '11:00am', teacher: 'Tristan' },
        { emoji: '✏️', prog: 'English Essentials', day: 'Sat 17 May', time: '2:00pm',  teacher: 'Gwen'    },
      ].map(s => (
        <div key={s.prog} style={{ background: '#fff', borderRadius: 8, padding: '8px 10px', border: '1px solid #b8dbd9', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{s.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: OLP.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.prog}</div>
            <div style={{ fontSize: 10, color: '#7e8c8a' }}>{s.day} · {s.time} · {s.teacher}</div>
          </div>
        </div>
      ))}
      <div style={{ background: '#fdf0ea', borderRadius: 8, padding: '8px 10px', border: '1px solid #e8b49a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: OLP.rust }}>INVOICE DUE</div>
          <div style={{ fontSize: 11, color: '#374151' }}>HKD 2,340 · April period</div>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: OLP.rust, background: '#f8ddd3', padding: '2px 8px', borderRadius: 99 }}>Overdue</div>
      </div>
    </div>
  )
}

function TeacherPreview() {
  return (
    <div style={{ background: '#eef7f6', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#0a4e4b', letterSpacing: 0.5 }}>TODAY'S SCHEDULE — MON 12 MAY</div>
      {[
        { time: '10:00', student: 'Emma Chen',  prog: 'Math Explorers', dur: '60m', color: OLP.aqua },
        { time: '11:00', student: 'Lucas Wong', prog: 'Math Explorers', dur: '60m', color: OLP.aqua },
        { time: '14:00', student: 'Noah Chan',  prog: 'Reading Stars',  dur: '60m', color: OLP.rust },
      ].map(s => (
        <div key={s.student} style={{ background: '#fff', borderRadius: 8, padding: '8px 10px', borderLeft: `3px solid ${s.color}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', width: 36, flexShrink: 0 }}>{s.time}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: OLP.ink }}>{s.student}</div>
            <div style={{ fontSize: 10, color: '#9CA3AF' }}>{s.prog}</div>
          </div>
          <span style={{ fontSize: 10, color: '#9CA3AF', flexShrink: 0 }}>{s.dur}</span>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ flex: 1, background: '#fff', borderRadius: 8, padding: '8px 10px', border: '1px solid #d9e8e6', textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: OLP.teal }}>18</div>
          <div style={{ fontSize: 9, color: '#9CA3AF' }}>Sessions this month</div>
        </div>
        <div style={{ flex: 1, background: '#fff', borderRadius: 8, padding: '8px 10px', border: '1px solid #d9e8e6', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: OLP.teal }}>$6,300</div>
          <div style={{ fontSize: 9, color: '#9CA3AF' }}>Estimated pay</div>
        </div>
      </div>
    </div>
  )
}

function AdminPreview() {
  return (
    <div style={{ background: '#f4ede0', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {[
          { label: 'Active Students', value: '24',       color: OLP.teal },
          { label: 'Classes Today',   value: '8',        color: '#9B5DE5' },
          { label: 'Outstanding',     value: 'HKD 42k',  color: OLP.rust  },
          { label: 'Teacher Cost',    value: 'HKD 25k',  color: OLP.aqua  },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 8, padding: '8px 10px', border: '1px solid #d9c8a8' }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: '#9CA3AF', marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 8, padding: 10, border: '1px solid #d9c8a8' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', marginBottom: 6, letterSpacing: 0.5 }}>WEEK VIEW</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { day: 'Mon', blocks: [OLP.aqua, OLP.teal, OLP.rust] },
            { day: 'Tue', blocks: ['#9B5DE5'] },
            { day: 'Wed', blocks: [OLP.aqua, '#5BA76A'] },
            { day: 'Thu', blocks: [OLP.teal, OLP.rust] },
            { day: 'Fri', blocks: ['#F0A94A', OLP.aqua] },
          ].map(col => (
            <div key={col.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ fontSize: 8, color: '#9CA3AF', textAlign: 'center', fontWeight: 700 }}>{col.day}</div>
              {col.blocks.map((c, i) => (
                <div key={i} style={{ height: 16, borderRadius: 3, background: `${c}55`, borderLeft: `2px solid ${c}` }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Role card ────────────────────────────────────────────────────────────────

interface RoleCardProps {
  role: string
  title: string
  tagline: string
  accent: string
  lightBg: string
  preview: ReactNode
  features: string[]
  email: string
  password: string
  onQuickLogin: (email: string, password: string) => void
}

function RoleCard({ role, title, tagline, accent, lightBg, preview, features, email, password, onQuickLogin }: RoleCardProps) {
  return (
    <div style={{
      background: '#fff', borderRadius: 20,
      border: '1px solid rgba(28,42,44,0.1)',
      boxShadow: '0 2px 12px rgba(28,42,44,0.06)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ background: lightBg, padding: '20px 22px 16px', borderBottom: `2px solid ${accent}22` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            {role === 'Parent' ? '👨‍👩‍👧' : role === 'Teacher' ? '👩‍🏫' : '⚙️'}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: OLP.ink }}>{title}</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{tagline}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0', background: '#fff' }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(28,42,44,0.08)', boxShadow: '0 2px 8px rgba(28,42,44,0.06)' }}>
          <div style={{ background: '#F3F4F6', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 5, borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FC5F57' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FEBC2E' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#28C840' }} />
            <div style={{ flex: 1, marginLeft: 6, background: '#E5E7EB', borderRadius: 4, height: 14, display: 'flex', alignItems: 'center', paddingLeft: 6 }}>
              <span style={{ fontSize: 8, color: '#9CA3AF' }}>ourlearningportal.com/{role.toLowerCase()}</span>
            </div>
          </div>
          <div style={{ padding: 10 }}>{preview}</div>
        </div>
      </div>

      <div style={{ padding: '16px 22px', flex: 1 }}>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {features.map(f => (
            <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151' }}>
              <span style={{ color: accent, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>✓</span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ padding: '0 22px 20px' }}>
        <button
          onClick={() => onQuickLogin(email, password)}
          style={{ width: '100%', padding: '10px 0', borderRadius: 10, background: accent, color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'opacity 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Sign in as {role} →
        </button>
        <div style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginTop: 5 }}>{email}</div>
      </div>
    </div>
  )
}

// ─── Login page ───────────────────────────────────────────────────────────────

const QUICK_ROLES = [
  {
    role: 'Parent', emoji: '👨‍👩‍👧', accent: OLP.aqua, lightBg: '#eef7f6',
    tagline: "Track your child's sessions, invoices and progress.",
    email: 'sarah.lam@hkmail.com', password: 'parent123',
    path: '/portal/parent/dashboard',
  },
  {
    role: 'Teacher', emoji: '👩‍🏫', accent: OLP.teal, lightBg: '#eef7f6',
    tagline: 'Weekly schedule, earnings, availability and payslips.',
    email: 'beverly@ourlearningportal.com', password: 'teacher123',
    path: '/portal/teacher/dashboard',
  },
  {
    role: 'Admin', emoji: '⚙️', accent: OLP.rust, lightBg: '#fdf0ea',
    tagline: 'Students, invoices, teachers, calendar — full control.',
    email: 'admin@ourlearningportal.com', password: 'admin123',
    path: '/portal/admin/dashboard',
  },
]

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const demoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    const dest = user.role === 'ADMIN' ? R.ADMIN_DASHBOARD : user.role === 'TEACHER' ? R.TEACHER_DASHBOARD : R.PARENT_DASHBOARD
    navigate(dest, { replace: true })
  }, [user, navigate])

  async function quickLogin(email: string, password: string) {
    try { await login(email, password) }
    catch { /* credentials are hardcoded and correct */ }
  }

  const ROLES: Omit<RoleCardProps, 'onQuickLogin'>[] = [
    {
      role: 'Parent', title: 'Parent Portal', tagline: "Stay connected with your child's learning",
      accent: OLP.aqua, lightBg: '#eef7f6',
      preview: <ParentPreview />,
      features: ['View upcoming sessions and full booking history', 'Reschedule or cancel classes with ease', 'View and track invoices', 'Monitor progress across subjects'],
      email: 'sarah.lam@hkmail.com', password: 'parent123',
    },
    {
      role: 'Teacher', title: 'Teacher Portal', tagline: 'Everything you need to teach effectively',
      accent: OLP.teal, lightBg: '#eef7f6',
      preview: <TeacherPreview />,
      features: ['View your full weekly teaching schedule', 'Mark sessions complete or flag for makeup', 'Track earnings and download payslips', 'Set and update your availability'],
      email: 'beverly@ourlearningportal.com', password: 'teacher123',
    },
    {
      role: 'Admin', title: 'Admin Portal', tagline: 'Full operational control of the centre',
      accent: OLP.rust, lightBg: '#fdf0ea',
      preview: <AdminPreview />,
      features: ['Manage all students, parents and enrolments', 'Full weekly calendar with overlap detection', 'Manage programmes and assign teachers', 'Generate invoices and send payment reminders', 'Track teacher costs and issue payslips'],
      email: 'admin@ourlearningportal.com', password: 'admin123',
    },
  ]

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Hero: one-click role selection ── */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', background: `linear-gradient(135deg, ${OLP.aqua} 0%, ${OLP.rust} 50%, ${OLP.teal} 100%)` }}>
        <div style={{ width: '100%', maxWidth: 480 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, borderRadius: 16, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', marginBottom: 12, padding: '10px 22px' }}>
              <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
                <path d="M8 56 V32 a24 24 0 0 1 48 0 V56" stroke={OLP.teal} strokeWidth="3" strokeLinecap="round" fill="none"/>
                <path d="M18 56 V34 a14 14 0 0 1 28 0 V56" stroke={OLP.teal} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.55"/>
                <line x1="6" y1="56" x2="58" y2="56" stroke={OLP.teal} strokeWidth="3" strokeLinecap="round"/>
                <circle cx="32" cy="34" r="3.2" fill="#b85e3a"/>
              </svg>
              <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: -0.3, color: OLP.ink }}>Our Learning</span>
              <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 19, color: OLP.teal, letterSpacing: -0.2 }}>portal</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: 0, fontWeight: 500 }}>
              Choose a view to explore the demo
            </p>
          </div>

          {/* One-click role cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {QUICK_ROLES.map(r => (
              <button
                key={r.role}
                onClick={() => quickLogin(r.email, r.password)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  width: '100%', padding: '18px 22px', borderRadius: 18,
                  background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)',
                  border: '1.5px solid rgba(255,255,255,0.32)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background .18s, border-color .18s',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.32)' }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 14, background: r.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {r.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 20, color: '#fff', fontWeight: 400, letterSpacing: -0.3, lineHeight: 1.1 }}>{r.role}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3, lineHeight: 1.4 }}>{r.tagline}</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M7 5l5 5-5 5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>

          <button onClick={() => demoRef.current?.scrollIntoView({ behavior: 'smooth' })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, margin: '32px auto 0', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600 }}>
            Platform overview
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: 'bounce 1.8s infinite' }}>
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Demo overview ── */}
      <div ref={demoRef} style={{ background: OLP.paper, padding: '64px 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 99, padding: '5px 16px', border: '1px solid rgba(28,42,44,0.1)', marginBottom: 16 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: OLP.teal, display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>PLATFORM OVERVIEW</span>
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: OLP.ink, margin: '0 0 12px', letterSpacing: -0.5 }}>
              Three portals, one seamless system
            </h2>
            <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
              Brought to you by 3 Peat — designed specifically for tutoring centre requirements.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {ROLES.map(r => <RoleCard key={r.role} {...r} onQuickLogin={quickLogin} />)}
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 48 }}>
            All data shown is sample data for demonstration purposes only.
            &nbsp;·&nbsp;
            <a href="/" style={{ color: OLP.teal, textDecoration: 'none' }}>← Back to Our Learning Portal</a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(5px); }
        }
      `}</style>
    </div>
  )
}
