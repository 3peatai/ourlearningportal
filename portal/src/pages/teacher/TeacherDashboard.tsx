import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, startOfWeek, addDays, parseISO } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import { useTeacherDashboard, useTeacherWeekSessions } from '../../hooks/teacher'
import ClassroomBG from '../../components/ui/ClassroomBG'
import Glass from '../../components/ui/Glass'
import GradPill from '../../components/ui/GradPill'
import Icon from '../../components/ui/Icon'
import Avatar from '../../components/ui/Avatar'
import Mascot from '../../components/ui/Mascot'
import Pill from '../../components/ui/Pill'
import BottomNav from '../../components/nav/BottomNav'
import { BB } from '../../lib/bb'
import { R } from '../../lib/routes'

const TEACHER_TABS = [
  { key: 'home',  path: R.TEACHER_DASHBOARD,    icon: 'home',     label: 'Home'         },
  { key: 'cls',   path: R.TEACHER_CLASSES,      icon: 'calendar', label: 'Classes'      },
  { key: 'avail', path: R.TEACHER_AVAILABILITY, icon: 'clock',    label: 'Availability' },
  { key: 'pay',   path: R.TEACHER_PAYSLIP,      icon: 'card',     label: 'Payslip'      },
]

function SessionSkeleton() {
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,.72)', display: 'flex', padding: '14px 12px', gap: 12 }}>
      <div className="skeleton-teal" style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="skeleton-teal" style={{ height: 15, width: '50%', borderRadius: 6 }} />
        <div className="skeleton-teal" style={{ height: 12, width: '70%', borderRadius: 6 }} />
        <div className="skeleton-teal" style={{ height: 10, width: '35%', borderRadius: 6 }} />
      </div>
    </div>
  )
}

const currentMondayStr = () => format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

const ROLE_MODES = [
  { label: 'Parent',  role: 'PARENT',  email: 'sarah.lam@hkmail.com',         pass: 'parent123',  path: R.PARENT_DASHBOARD  },
  { label: 'Teacher', role: 'TEACHER', email: 'beverly@ourlearningportal.com', pass: 'teacher123', path: R.TEACHER_DASHBOARD },
  { label: 'Admin',   role: 'ADMIN',   email: 'admin@ourlearningportal.com',   pass: 'admin123',   path: R.ADMIN_DASHBOARD   },
]

export default function TeacherDashboard() {
  const { user, logout, login } = useAuth()
  const navigate = useNavigate()

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const [weekStart, setWeekStart] = useState(currentMondayStr)
  const [selectedDay, setSelectedDay] = useState(todayStr)

  const { data: dashboard } = useTeacherDashboard()
  const { data: weekData, isLoading } = useTeacherWeekSessions(weekStart)
  const weekSessions = weekData?.sessions ?? []

  const weekDays = useMemo(() => {
    const monday = parseISO(weekStart)
    return Array.from({ length: 6 }, (_, i) => {
      const d = addDays(monday, i)
      return { dateStr: format(d, 'yyyy-MM-dd'), short: format(d, 'EEE'), num: format(d, 'd'), month: format(d, 'MMM') }
    })
  }, [weekStart])

  const isCurrentWeek = weekStart === currentMondayStr()
  const totalSessions = weekSessions.length
  const totalHours = Math.round(weekSessions.reduce((sum, s) => sum + s.durationMin / 60, 0) * 10) / 10
  const filteredSessions = weekSessions.filter(s => s.dateStr === selectedDay)
  const selectedLabel = selectedDay === todayStr ? "Today's Classes" : `${weekDays.find(d => d.dateStr === selectedDay)?.short ?? ''}'s Classes`
  const greeting = new Date().getHours() < 12 ? 'Good morning' : 'Good afternoon'
  const firstName = user?.name?.split(' ')[0] ?? ''

  useEffect(() => { document.title = 'Home — Our Learning Portal' }, [])

  function navigateWeek(dir: 1 | -1) {
    const newMonday = addDays(parseISO(weekStart), dir * 7)
    const newStart = format(newMonday, 'yyyy-MM-dd')
    const newSat = format(addDays(newMonday, 5), 'yyyy-MM-dd')
    setWeekStart(newStart)
    setSelectedDay(todayStr >= newStart && todayStr <= newSat ? todayStr : newStart)
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <ClassroomBG seed={7} />
      <div className="relative flex flex-col min-h-screen">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 relative z-10">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
              <path d="M8 56 V32 a24 24 0 0 1 48 0 V56" stroke={BB.teal} strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M18 56 V34 a14 14 0 0 1 28 0 V56" stroke={BB.teal} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.55"/>
              <line x1="6" y1="56" x2="58" y2="56" stroke={BB.teal} strokeWidth="3" strokeLinecap="round"/>
              <circle cx="32" cy="34" r="3.2" fill="#b85e3a"/>
            </svg>
            <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: -0.3, color: BB.ink }}>Our Learning</span>
            <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 17, color: BB.teal }}>portal</span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Mode switcher */}
            {ROLE_MODES.map(m => {
              const active = user?.role === m.role
              return (
                <button key={m.role} disabled={active}
                  onClick={async () => { try { await login(m.email, m.pass); navigate(m.path) } catch {} }}
                  style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
                    border: `1.5px solid ${active ? BB.teal : 'rgba(28,42,44,0.18)'}`,
                    background: active ? BB.teal : 'rgba(255,255,255,0.75)',
                    color: active ? '#fff' : BB.inkSoft,
                    cursor: active ? 'default' : 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {active ? `✓ ${m.label}` : m.label}
                </button>
              )
            })}
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.65)', border: '1px solid rgba(255,255,255,.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}>
              <Icon name="bell" size={18} color={BB.ink} />
            </div>
            <button onClick={() => { logout(); navigate(R.LOGIN) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Avatar name={user?.name ?? ''} color={BB.teal} size={36} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-28 relative z-10">

          {/* Greeting */}
          <div style={{ marginTop: 6, marginBottom: 16 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: BB.ink, letterSpacing: -0.4 }}>{greeting}, {firstName} 👋</div>
            {dashboard && <div style={{ fontSize: 13, color: BB.inkSoft, marginTop: 2 }}>{dashboard.speciality}</div>}
          </div>

          {/* ── Week navigation ── */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => navigateWeek(-1)} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.65)', border: '1px solid rgba(255,255,255,.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="chev-l" size={18} color={BB.ink} />
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: BB.ink }}>{weekDays[0]?.num} {weekDays[0]?.month} — {weekDays[5]?.num} {weekDays[5]?.month}</div>
              {isCurrentWeek && <div style={{ fontSize: 11, fontWeight: 700, color: BB.teal, marginTop: 1 }}>This week</div>}
            </div>
            <button onClick={() => navigateWeek(1)} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.65)', border: '1px solid rgba(255,255,255,.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="chev-r" size={18} color={BB.ink} />
            </button>
          </div>

          {/* ── Week summary chips ── */}
          <div className="flex gap-3 mb-4">
            <Glass padding={14} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: BB.teal, lineHeight: 1 }}>{totalSessions}</div>
              <div style={{ fontSize: 11, color: BB.inkSoft, fontWeight: 700, marginTop: 3 }}>CLASSES</div>
            </Glass>
            <Glass padding={14} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: BB.teal, lineHeight: 1 }}>{totalHours}</div>
              <div style={{ fontSize: 11, color: BB.inkSoft, fontWeight: 700, marginTop: 3 }}>HOURS</div>
            </Glass>
            {isCurrentWeek && dashboard && (
              <Glass padding={14} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: BB.teal, lineHeight: 1 }}>{Math.round(dashboard.currentPeriodEarnings / 1000)}k</div>
                <div style={{ fontSize: 11, color: BB.inkSoft, fontWeight: 700, marginTop: 3 }}>HKD {dashboard.currentPeriod.split(' ')[0].toUpperCase()}</div>
              </Glass>
            )}
          </div>

          {/* ── Day strip Mon–Sat ── */}
          <div className="flex gap-1.5 mb-4">
            {weekDays.map(d => {
              const active = d.dateStr === selectedDay
              const isToday = d.dateStr === todayStr
              const hasSessions = weekSessions.some(s => s.dateStr === d.dateStr)
              return (
                <button key={d.dateStr} onClick={() => setSelectedDay(d.dateStr)} style={{ flex: 1, height: 62, borderRadius: 14, border: 'none', background: active ? BB.teal : hasSessions ? `${BB.amber}40` : 'rgba(255,255,255,.65)', backdropFilter: 'blur(10px)', color: active ? '#fff' : BB.ink, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, boxShadow: active ? `0 6px 18px ${BB.teal}44` : hasSessions ? `inset 0 0 0 1.5px ${BB.amber}99` : isToday ? `inset 0 0 0 2px ${BB.teal}55` : 'inset 0 0 0 1px rgba(255,255,255,.6)', transition: 'all .15s' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.75 }}>{d.short.toUpperCase()}</div>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>{d.num}</div>
                  {hasSessions && <div style={{ width: 5, height: 5, borderRadius: '50%', background: active ? 'rgba(255,255,255,.8)' : BB.amber }} />}
                  {!hasSessions && isToday && <div style={{ width: 5, height: 5, borderRadius: '50%', background: active ? 'rgba(255,255,255,.8)' : BB.teal }} />}
                </button>
              )
            })}
          </div>

          {/* ── Session list ── */}
          <div style={{ fontSize: 13, fontWeight: 800, color: BB.inkSoft, letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>{selectedLabel}</div>

          {isLoading ? (
            <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <SessionSkeleton key={i} />)}</div>
          ) : filteredSessions.length === 0 ? (
            <Glass padding={24} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 30 }}>😴</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: BB.ink, marginTop: 8 }}>{selectedDay === todayStr ? 'No classes today' : `No classes ${weekDays.find(d => d.dateStr === selectedDay)?.short ?? ''}`}</div>
              <div style={{ fontSize: 12, color: BB.inkSoft, marginTop: 4 }}>Enjoy the free time!</div>
            </Glass>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredSessions.map(s => (
                <div key={s.id} style={{ borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.6)', boxShadow: '0 4px 20px rgba(28,42,44,.07)', display: 'flex' }}>
                  <div style={{ width: 5, background: BB.teal, flexShrink: 0 }} />
                  <div style={{ flex: 1, padding: '14px 14px 14px 12px' }}>
                    <div className="flex items-start gap-3">
                      <Mascot kind={s.mascot} size={38} />
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 16, fontWeight: 800, color: BB.ink }}>{s.studentFirstName}</div>
                        <div style={{ fontSize: 13, color: BB.inkSoft, marginTop: 1 }}>{s.programme}</div>
                        <div style={{ fontSize: 12, color: BB.inkMute, marginTop: 1 }}>{s.displayTime}</div>
                      </div>
                      <Pill color={BB.teal}><Icon name="clock" size={10} /> {s.durationMin} min</Pill>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Earnings + CTA ── */}
          <div style={{ marginTop: 24 }}>
            {isCurrentWeek && dashboard && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, background: `${BB.teal}18`, border: `1px solid ${BB.teal}33`, marginBottom: 14 }}>
                <Icon name="card" size={15} color={BB.teal} />
                <span style={{ fontSize: 13, fontWeight: 700, color: BB.teal }}>{dashboard.currentPeriod} earnings · HKD {Math.round(dashboard.currentPeriodEarnings).toLocaleString()}</span>
              </div>
            )}
            <GradPill variant="teal" size="md" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate(R.TEACHER_AVAILABILITY)}>
              <Icon name="clock" size={16} /> Submit Availability
            </GradPill>
          </div>
        </div>

        <BottomNav tabs={TEACHER_TABS} accent={BB.teal} />
      </div>
    </div>
  )
}
