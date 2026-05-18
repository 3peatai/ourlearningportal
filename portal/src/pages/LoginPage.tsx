import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../context/AuthContext'
import { R } from '../lib/routes'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

const ROLE_TABS = ['PARENT', 'TEACHER', 'ADMIN'] as const
const HINTS: Record<string, string> = {
  PARENT:  'sarah.lam@hkmail.com / parent123',
  TEACHER: 'beverly@ourlearningportal.com / teacher123',
  ADMIN:   'admin@ourlearningportal.com / admin123',
}

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
  preview: React.ReactNode
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

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'PARENT' | 'TEACHER' | 'ADMIN'>('PARENT')
  const [serverError, setServerError] = useState('')
  const demoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    const dest = user.role === 'ADMIN' ? R.ADMIN_DASHBOARD : user.role === 'TEACHER' ? R.TEACHER_DASHBOARD : R.PARENT_DASHBOARD
    navigate(dest, { replace: true })
  }, [user, navigate])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError('')
    try { await login(data.email, data.password) }
    catch { setServerError('Invalid email or password') }
  }

  async function quickLogin(email: string, password: string) {
    setServerError('')
    try { await login(email, password) }
    catch { setServerError('Invalid email or password') }
  }

  const ROLES: Omit<RoleCardProps, 'onQuickLogin'>[] = [
    {
      role: 'Parent', title: 'Parent Portal', tagline: "Stay connected with your child's learning",
      accent: OLP.aqua, lightBg: '#eef7f6',
      preview: <ParentPreview />,
      features: ['View upcoming sessions and full booking history', 'Reschedule or cancel classes with ease', 'Enrol children in new programmes', 'View and track invoices', 'Monitor progress across subjects'],
      email: 'sarah.lam@hkmail.com', password: 'parent123',
    },
    {
      role: 'Teacher', title: 'Teacher Portal', tagline: 'Everything you need to teach effectively',
      accent: OLP.teal, lightBg: '#eef7f6',
      preview: <TeacherPreview />,
      features: ['View your full weekly teaching schedule', 'Mark sessions complete or flag for makeup', 'Access student notes and learning history', 'Track earnings and download payslips', 'Set and update your availability'],
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

      {/* ── Hero / Login ── */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16, background: `linear-gradient(135deg, ${OLP.aqua} 0%, ${OLP.rust} 50%, ${OLP.teal} 100%)` }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Logo / wordmark */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, borderRadius: 16, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', marginBottom: 10, padding: '10px 20px' }}>
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="12" stroke={OLP.teal} strokeWidth="1.6"/>
                <circle cx="14" cy="14" r="6" fill={OLP.teal}/>
                <circle cx="22" cy="14" r="1.6" fill={OLP.teal}/>
              </svg>
              <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: -0.3, color: OLP.ink }}>Our Learning</span>
              <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 17, color: OLP.teal, letterSpacing: -0.2 }}>portal</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: 0 }}>
              Parent &amp; Teacher Portal — Demo
            </p>
          </div>

          {/* Card */}
          <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', borderRadius: 24, padding: 24, border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

            {/* Role tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.1)', borderRadius: 12, padding: 4, marginBottom: 20 }}>
              {ROLE_TABS.map(role => (
                <button key={role} type="button" onClick={() => setActiveTab(role)} style={{ flex: 1, fontSize: 12, fontWeight: 700, padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: activeTab === role ? '#fff' : 'transparent', color: activeTab === role ? OLP.ink : 'rgba(255,255,255,0.7)', boxShadow: activeTab === role ? '0 1px 4px rgba(0,0,0,0.12)' : 'none' }}>
                  {role === 'ADMIN' ? 'Admin' : role === 'TEACHER' ? 'Teacher' : 'Parent'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Email</label>
                <input {...register('email')} type="email" autoComplete="email" placeholder={HINTS[activeTab].split(' / ')[0]} style={{ width: '100%', padding: '11px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                {errors.email && <p style={{ color: '#FCA5A5', fontSize: 11, margin: '4px 0 0' }}>{errors.email.message}</p>}
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Password</label>
                <input {...register('password')} type="password" autoComplete="current-password" placeholder="••••••••" style={{ width: '100%', padding: '11px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                {errors.password && <p style={{ color: '#FCA5A5', fontSize: 11, margin: '4px 0 0' }}>{errors.password.message}</p>}
              </div>

              {serverError && <p style={{ color: '#FCA5A5', fontSize: 12, textAlign: 'center', background: 'rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 0', margin: 0 }}>{serverError}</p>}

              <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '12px 0', borderRadius: 12, background: '#fff', border: 'none', fontWeight: 700, color: OLP.ink, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', opacity: isSubmitting ? 0.6 : 1, transition: 'opacity 0.15s' }}>
                {isSubmitting ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
              Demo: {HINTS[activeTab]}
            </p>
          </div>

          <button onClick={() => demoRef.current?.scrollIntoView({ behavior: 'smooth' })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, margin: '28px auto 0', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600 }}>
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
