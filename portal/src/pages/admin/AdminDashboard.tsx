import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  GraduationCap, BookOpen,
  TrendingUp, Send, CheckCircle2,
  Clock, X, MapPin, RefreshCw, AlertCircle,
} from 'lucide-react'
import { useAdminStats, useAdminActivity, useTodaySessions, useUpdateClass, useDevReset } from '../../hooks/admin'
import type { CalendarSession, ActivityEvent } from '../../hooks/admin'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { R } from '../../lib/routes'

const ROLE_MODES = [
  { label: 'Parent',  role: 'PARENT',  email: 'sarah.lam@hkmail.com',         pass: 'parent123',  path: R.PARENT_DASHBOARD  },
  { label: 'Teacher', role: 'TEACHER', email: 'beverly@ourlearningportal.com', pass: 'teacher123', path: R.TEACHER_DASHBOARD },
  { label: 'Admin',   role: 'ADMIN',   email: 'admin@ourlearningportal.com',   pass: 'admin123',   path: R.ADMIN_DASHBOARD   },
]

// ─── Teacher colour map (by first name) ──────────────────────────────────────
const TEACHER_COLORS: Record<string, string> = {
  Beverly: '#F5C842',
  Tristan: '#E8623A',
  May:     '#4AADBC',
  Cato:    '#9B5DE5',
  Gwen:    '#06D6A0',
  Donna:   '#F0A94A',
}
function tColor(fullName: string) {
  for (const [k, v] of Object.entries(TEACHER_COLORS)) {
    if (fullName.includes(k)) return v
  }
  return '#9CA3AF'
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  trend: string
  trendUp: boolean
}
function StatCard({ label, value, trend, trendUp }: StatCardProps) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '20px 22px',
      border: '1px solid #F0EDE8', boxShadow: '0 1px 4px rgba(0,0,0,.04)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700,
          color: trendUp ? '#16A34A' : '#DC2626',
          background: trendUp ? '#F0FDF4' : '#FEF2F2',
          padding: '3px 8px', borderRadius: 999,
        }}>
          <TrendingUp size={11} />
          {trend}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#1A1A2E', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  )
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
const TIMELINE_START = 10   // 10am
const TIMELINE_END   = 20   // 8pm (exclusive)
const PX_PER_HOUR   = 72

function Timeline({ sessions, onSelect }: { sessions: CalendarSession[]; onSelect: (s: CalendarSession) => void }) {
  const hours = Array.from({ length: TIMELINE_END - TIMELINE_START }, (_, i) => TIMELINE_START + i)
  const totalHeight = (TIMELINE_END - TIMELINE_START) * PX_PER_HOUR

  const inRange = sessions.filter(s => s.hktHour >= TIMELINE_START && s.hktHour < TIMELINE_END)

  return (
    <div style={{ position: 'relative', height: totalHeight }}>
      {/* Hour lines */}
      {hours.map(h => (
        <div key={h} style={{
          position: 'absolute', top: (h - TIMELINE_START) * PX_PER_HOUR,
          left: 0, right: 0, display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', width: 36, flexShrink: 0, paddingTop: 2 }}>
            {h === 12 ? '12pm' : h < 12 ? `${h}am` : `${h - 12}pm`}
          </span>
          <div style={{ flex: 1, height: 1, background: '#F0EDE8', marginTop: 8 }} />
        </div>
      ))}

      {/* Session blocks */}
      {inRange.map(s => {
        const top    = (s.hktHour - TIMELINE_START) * PX_PER_HOUR + (s.hktMin / 60) * PX_PER_HOUR
        const height = Math.max((s.durationMin / 60) * PX_PER_HOUR, 28)
        const color  = tColor(s.teacher.name)

        return (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            style={{
              position: 'absolute',
              top: top + 1,
              left: 44,
              right: 0,
              height: height - 2,
              borderRadius: 8,
              background: `${color}22`,
              border: `2px solid ${color}88`,
              borderLeft: `4px solid ${color}`,
              padding: '4px 8px',
              textAlign: 'left',
              cursor: 'pointer',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A2E', lineHeight: 1.2 }}>
              {s.student.name.split(' ')[0]}
            </div>
            {height > 36 && (
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>
                {s.programme.name.length > 20 ? s.programme.name.slice(0, 18) + '…' : s.programme.name}
              </div>
            )}
          </button>
        )
      })}

      {inRange.length === 0 && (
        <div style={{
          position: 'absolute', left: 44, right: 0,
          top: '40%', textAlign: 'center', color: '#D1D5DB', fontSize: 13,
        }}>
          No classes today
        </div>
      )}
    </div>
  )
}

// ─── Activity Feed ────────────────────────────────────────────────────────────
const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  class_booked:     <BookOpen size={14} />,
  invoice_sent:     <Send size={14} />,
  invoice_paid:     <CheckCircle2 size={14} />,
  invoice_overdue:  <AlertCircle size={14} />,
  student_enrolled: <GraduationCap size={14} />,
  reschedule:       <Clock size={14} />,
}
const ACTIVITY_COLORS: Record<string, string> = {
  class_booked:     '#4AADBC',
  invoice_sent:     '#F5C842',
  invoice_paid:     '#16A34A',
  invoice_overdue:  '#DC2626',
  student_enrolled: '#9B5DE5',
  reschedule:       '#F0A94A',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 2)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {events.map((e, idx) => {
        const color = ACTIVITY_COLORS[e.type] ?? '#9CA3AF'
        return (
          <div key={e.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '10px 0',
            borderBottom: idx < events.length - 1 ? '1px solid #F5F3EF' : 'none',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: `${color}18`, color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {ACTIVITY_ICONS[e.type] ?? <MapPin size={14} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: '#1A1A2E', lineHeight: 1.4 }}>{e.description}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{timeAgo(e.timestamp)}</div>
            </div>
          </div>
        )
      })}
      {events.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#D1D5DB', fontSize: 13 }}>
          No recent activity
        </div>
      )}
    </div>
  )
}

// ─── Session Detail Modal ─────────────────────────────────────────────────────
function SessionModal({ session, onClose }: { session: CalendarSession; onClose: () => void }) {
  const updateMutation = useUpdateClass()
  const color = tColor(session.teacher.name)

  async function handleStatus(status: string) {
    await updateMutation.mutateAsync({ id: session.id, status })
    onClose()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 40, borderRadius: 2, background: color }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A2E' }}>{session.student.name}</div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>{session.programme.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, border: 'none', background: '#F5F3EF', cursor: 'pointer' }}>
            <X size={16} color="#6B7280" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Teacher', value: session.teacher.name },
            { label: 'Time', value: `${session.displayDate} · ${session.displayTime}` },
            { label: 'Duration', value: `${session.durationMin} minutes` },
            { label: 'Status', value: session.status },
            ...(session.isMakeup ? [{ label: 'Type', value: 'Makeup class' }] : []),
            ...(session.notes ? [{ label: 'Notes', value: session.notes }] : []),
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: 12 }}>
              <span style={{ width: 72, fontSize: 12, fontWeight: 600, color: '#9CA3AF', paddingTop: 1 }}>{label}</span>
              <span style={{ fontSize: 13, color: '#1A1A2E', flex: 1 }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {session.status === 'SCHEDULED' && (
            <>
              <button
                onClick={() => handleStatus('COMPLETED')}
                disabled={updateMutation.isPending}
                style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', background: '#4AADBC', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                ✓ Mark Done
              </button>
              <button
                onClick={() => handleStatus('CANCELLED')}
                disabled={updateMutation.isPending}
                style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </>
          )}
          {session.status !== 'SCHEDULED' && (
            <div style={{ flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 10, background: '#F5F3EF', color: '#9CA3AF', fontSize: 13, fontWeight: 600 }}>
              {session.status}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton variants ────────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', border: '1px solid #F0EDE8', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Skeleton width={70} height={22} borderRadius={99} />
      </div>
      <Skeleton width="65%" height={36} />
      <Skeleton width="45%" height={14} />
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const { data: stats, isLoading: loadingStats } = useAdminStats()
  const { data: activity = [], isLoading: loadingActivity } = useAdminActivity()
  const { data: todaySessions = [], isLoading: loadingToday } = useTodaySessions()
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null)
  const resetMutation = useDevReset()

  const todayLabel = format(new Date(), 'EEE d MMM')

  useEffect(() => { document.title = 'Dashboard — Our Learning Portal' }, [])

  function handleReset() {
    resetMutation.mutate(undefined)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>

      {/* Page header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1A1A2E', margin: 0, letterSpacing: -0.5 }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: '#9CA3AF', margin: '4px 0 0', fontWeight: 500 }}>{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        </div>
        {/* Mode switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {ROLE_MODES.map(m => {
            const active = user?.role === m.role
            return (
              <button
                key={m.role}
                disabled={active}
                onClick={async () => { try { await login(m.email, m.pass); navigate(m.path) } catch {} }}
                style={{
                  fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 99,
                  border: `1.5px solid ${active ? '#0c7872' : 'rgba(28,42,44,0.18)'}`,
                  background: active ? '#0c7872' : '#fff',
                  color: active ? '#fff' : '#4a5b5c',
                  cursor: active ? 'default' : 'pointer',
                  transition: 'all .15s',
                }}
              >
                {active ? `✓ ${m.label}` : m.label}
              </button>
            )
          })}
          <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 4 }}>demo mode</span>
        </div>
      </div>

      {/* Stat cards — 4-column desktop, 2-column tablet/mobile */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Active Students"
              value={stats?.activeStudents ?? '—'}
              trend="+3 this month"
              trendUp
            />
            <StatCard
              label="Classes Today"
              value={stats?.classesToday ?? '—'}
              trend={`${stats?.classesToday ?? 0} scheduled`}
              trendUp
            />
            <StatCard
              label="Outstanding Invoices"
              value={stats ? `HKD ${stats.outstandingInvoices.total.toLocaleString()}` : '—'}
              trend={`${stats?.outstandingInvoices.count ?? 0} pending`}
              trendUp={false}
            />
            <StatCard
              label="Monthly Teacher Cost"
              value={stats ? `HKD ${stats.monthlyTeacherCost.toLocaleString()}` : '—'}
              trend="Completed sessions"
              trendUp={false}
            />
          </>
        )}
      </div>

      {/* Two-column layout on desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 380px', gap: 20, alignItems: 'start' }}>

        {/* Today's Timeline */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0EDE8', boxShadow: '0 1px 4px rgba(0,0,0,.04)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #F5F3EF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A2E' }}>Today's Schedule</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{todayLabel} · {todaySessions.length} classes</div>
            </div>
            {/* Teacher colour legend */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {Object.entries(TEACHER_COLORS).map(([name, color]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6B7280' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  {name}
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '16px 20px 20px', overflowY: 'auto', maxHeight: 580 }}>
            {loadingToday ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={56} borderRadius={10} />
                ))}
              </div>
            ) : (
              <Timeline sessions={todaySessions} onSelect={setSelectedSession} />
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #F0EDE8', boxShadow: '0 1px 4px rgba(0,0,0,.04)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #F5F3EF' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A2E' }}>Recent Activity</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Latest 10 events</div>
          </div>
          <div style={{ padding: '4px 20px 16px' }}>
            {loadingActivity ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Skeleton width={30} height={30} borderRadius={8} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <Skeleton height={13} width={`${60 + (i % 3) * 10}%`} />
                      <Skeleton height={10} width="30%" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ActivityFeed events={activity} />
            )}
          </div>
        </div>
      </div>

      {/* Session detail modal */}
      {selectedSession && (
        <SessionModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}

      {/* ── Dev reset footer ── */}
      <div style={{ marginTop: 48, textAlign: 'center' }}>
        <button
          onClick={handleReset}
          disabled={resetMutation.isPending}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#D1D5DB', fontSize: 12, fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            transition: 'color .15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#9CA3AF')}
          onMouseLeave={e => (e.currentTarget.style.color = '#D1D5DB')}
        >
          <RefreshCw size={11} />
          {resetMutation.isPending ? 'Resetting…' : 'Reset Demo Data'}
        </button>
      </div>
    </div>
  )
}
