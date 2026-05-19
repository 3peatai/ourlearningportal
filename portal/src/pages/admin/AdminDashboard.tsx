import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  BookOpen, Send, CheckCircle2,
  Clock, X, MapPin, RefreshCw, AlertCircle, GraduationCap,
} from 'lucide-react'
import { useAdminStats, useAdminActivity, useTodaySessions, useUpdateClass, useDevReset } from '../../hooks/admin'
import type { CalendarSession, ActivityEvent } from '../../hooks/admin'
import { Skeleton } from '../../components/ui/Skeleton'

// ─── OLP palette (mirrors BB.ts / landing page) ───────────────────────────────
const TEAL   = '#0c7872'
const CORAL  = '#b85e3a'
const AMBER  = '#F0A94A'
const INK    = '#1c2a2c'
const INK2   = '#4a5b5c'
const INK3   = '#9CA3AF'
const PAPER  = '#fffcf7'
const BORDER = '#E8DFD1'

// ─── Teacher colour map ───────────────────────────────────────────────────────
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
  return INK3
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtHKD(val: number) {
  if (val >= 10000) return `HKD ${Math.round(val / 1000)}k`
  if (val >= 1000)  return `HKD ${(val / 1000).toFixed(1)}k`
  return `HKD ${val.toLocaleString()}`
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent: string }) {
  return (
    <div style={{
      background: PAPER, borderRadius: 8, padding: '16px 18px',
      border: `1px solid ${BORDER}`,
      borderTop: `3px solid ${accent}`,
    }}>
      <div style={{
        fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700,
        color: accent, lineHeight: 1, letterSpacing: -0.5, marginBottom: 8,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: INK3, fontWeight: 500 }}>{sub}</div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div style={{ background: PAPER, borderRadius: 8, padding: '16px 18px', border: `1px solid ${BORDER}`, borderTop: `3px solid ${BORDER}` }}>
      <Skeleton width="55%" height={28} borderRadius={4} />
      <div style={{ marginTop: 10 }}><Skeleton width="70%" height={14} /></div>
      <div style={{ marginTop: 6 }}><Skeleton width="45%" height={11} /></div>
    </div>
  )
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
const TIMELINE_START = 10
const TIMELINE_END   = 20
const PX_PER_HOUR   = 72

function Timeline({ sessions, onSelect }: { sessions: CalendarSession[]; onSelect: (s: CalendarSession) => void }) {
  const hours = Array.from({ length: TIMELINE_END - TIMELINE_START }, (_, i) => TIMELINE_START + i)
  const totalHeight = (TIMELINE_END - TIMELINE_START) * PX_PER_HOUR
  const inRange = sessions.filter(s => s.hktHour >= TIMELINE_START && s.hktHour < TIMELINE_END)

  return (
    <div style={{ position: 'relative', height: totalHeight }}>
      {hours.map(h => (
        <div key={h} style={{ position: 'absolute', top: (h - TIMELINE_START) * PX_PER_HOUR, left: 0, right: 0, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: INK3, width: 36, flexShrink: 0, paddingTop: 2 }}>
            {h === 12 ? '12pm' : h < 12 ? `${h}am` : `${h - 12}pm`}
          </span>
          <div style={{ flex: 1, height: 1, background: BORDER, marginTop: 8 }} />
        </div>
      ))}

      {inRange.map(s => {
        const top    = (s.hktHour - TIMELINE_START) * PX_PER_HOUR + (s.hktMin / 60) * PX_PER_HOUR
        const height = Math.max((s.durationMin / 60) * PX_PER_HOUR, 28)
        const color  = tColor(s.teacher.name)
        return (
          <button key={s.id} onClick={() => onSelect(s)} style={{
            position: 'absolute', top: top + 1, left: 44, right: 0, height: height - 2,
            borderRadius: 6, background: `${color}1a`, border: `1.5px solid ${color}88`,
            borderLeft: `4px solid ${color}`, padding: '4px 8px',
            textAlign: 'left', cursor: 'pointer', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: INK, lineHeight: 1.2 }}>
              {s.student.name.split(' ')[0]}
            </div>
            {height > 36 && (
              <div style={{ fontSize: 11, color: INK2, marginTop: 1 }}>
                {s.programme.name.length > 20 ? s.programme.name.slice(0, 18) + '…' : s.programme.name}
              </div>
            )}
          </button>
        )
      })}

      {inRange.length === 0 && (
        <div style={{ position: 'absolute', left: 44, right: 0, top: '40%', textAlign: 'center', color: '#D1D5DB', fontSize: 13 }}>
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
  invoice_sent:     AMBER,
  invoice_paid:     '#16A34A',
  invoice_overdue:  CORAL,
  student_enrolled: '#9B5DE5',
  reschedule:       AMBER,
}

function timeAgo(iso: string) {
  const diff  = Date.now() - new Date(iso).getTime()
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
        const color = ACTIVITY_COLORS[e.type] ?? INK3
        return (
          <div key={e.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '10px 0',
            borderBottom: idx < events.length - 1 ? `1px solid ${BORDER}` : 'none',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 6, flexShrink: 0,
              background: `${color}18`, color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {ACTIVITY_ICONS[e.type] ?? <MapPin size={14} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: INK, lineHeight: 1.4 }}>{e.description}</div>
              <div style={{ fontSize: 11, color: INK3, marginTop: 2 }}>{timeAgo(e.timestamp)}</div>
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,.15)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 40, borderRadius: 2, background: color }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: INK }}>{session.student.name}</div>
              <div style={{ fontSize: 13, color: INK2 }}>{session.programme.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, border: 'none', background: '#F5F3EF', cursor: 'pointer' }}>
            <X size={16} color={INK2} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Teacher',  value: session.teacher.name },
            { label: 'Time',     value: `${session.displayDate} · ${session.displayTime}` },
            { label: 'Duration', value: `${session.durationMin} minutes` },
            { label: 'Status',   value: session.status },
            ...(session.isMakeup ? [{ label: 'Type', value: 'Makeup class' }] : []),
            ...(session.notes    ? [{ label: 'Notes', value: session.notes  }] : []),
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: 12 }}>
              <span style={{ width: 72, fontSize: 12, fontWeight: 600, color: INK3, paddingTop: 1 }}>{label}</span>
              <span style={{ fontSize: 13, color: INK, flex: 1 }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {session.status === 'SCHEDULED' && (
            <>
              <button onClick={() => handleStatus('COMPLETED')} disabled={updateMutation.isPending} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: TEAL, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✓ Mark Done</button>
              <button onClick={() => handleStatus('CANCELLED')}  disabled={updateMutation.isPending} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: `1px solid ${CORAL}88`, background: `${CORAL}10`, color: CORAL, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            </>
          )}
          {session.status !== 'SCHEDULED' && (
            <div style={{ flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 8, background: '#F5F3EF', color: INK3, fontSize: 13, fontWeight: 600 }}>{session.status}</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Today panel (shared by mobile + desktop) ─────────────────────────────────
function TodayPanel({ sessions, loading, todayLabel, onSelect, compact }: {
  sessions: CalendarSession[]; loading: boolean; todayLabel: string
  onSelect: (s: CalendarSession) => void; compact?: boolean
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
      <div style={{ padding: compact ? '14px 18px 10px' : '16px 22px 12px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: INK }}>Today's Schedule</div>
          <div style={{ fontSize: 12, color: INK3, marginTop: 1 }}>{todayLabel} · {sessions.length} classes</div>
        </div>
        {!compact && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {Object.entries(TEACHER_COLORS).map(([name, color]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: INK2 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                {name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: compact ? '12px 16px 14px' : '14px 20px 18px', overflowY: 'auto', maxHeight: compact ? 320 : 560 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: compact ? 3 : 4 }).map((_, i) => <Skeleton key={i} height={52} borderRadius={8} />)}
          </div>
        ) : (
          <Timeline sessions={sessions} onSelect={onSelect} />
        )}
      </div>
    </div>
  )
}

// ─── Activity panel ───────────────────────────────────────────────────────────
function ActivityPanel({ events, loading }: { events: ActivityEvent[]; loading: boolean }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
      <div style={{ padding: '16px 22px 12px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: INK }}>Recent Activity</div>
        <div style={{ fontSize: 12, color: INK3, marginTop: 1 }}>Latest events</div>
      </div>
      <div style={{ padding: '4px 20px 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Skeleton width={30} height={30} borderRadius={6} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton height={13} width={`${60 + (i % 3) * 10}%`} />
                  <Skeleton height={10} width="30%" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ActivityFeed events={events} />
        )}
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useAdminStats()
  const { data: activity = [], isLoading: loadingActivity } = useAdminActivity()
  const { data: todaySessions = [], isLoading: loadingToday } = useTodaySessions()
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null)
  const resetMutation = useDevReset()

  const todayLabel = format(new Date(), 'EEE d MMM')

  useEffect(() => { document.title = 'Dashboard — Our Learning Portal' }, [])

  return (
    <div style={{ padding: '24px 20px 48px', maxWidth: 1400, margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: INK3, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Admin</div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 30, fontWeight: 600, color: TEAL, margin: 0, letterSpacing: -0.4 }}>
            Dashboard
          </h1>
        </div>
        <div style={{ fontSize: 13, color: INK3, fontWeight: 500 }}>{format(new Date(), 'EEEE, d MMMM yyyy')}</div>
      </div>

      {/* ── Mobile: Today's Schedule (hidden on md+) ── */}
      <div className="md:hidden" style={{ marginBottom: 20 }}>
        <TodayPanel
          sessions={todaySessions}
          loading={loadingToday}
          todayLabel={todayLabel}
          onSelect={setSelectedSession}
          compact
        />
      </div>

      {/* ── Stat cards — 2 cols mobile, 4 cols desktop ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" style={{ marginBottom: 20 }}>
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Active Students"
              value={stats?.activeStudents ?? '—'}
              sub="+3 this month"
              accent={TEAL}
            />
            <StatCard
              label="Classes Today"
              value={stats?.classesToday ?? '—'}
              sub="scheduled"
              accent={AMBER}
            />
            <StatCard
              label="Outstanding"
              value={stats ? fmtHKD(stats.outstandingInvoices.total) : '—'}
              sub={`${stats?.outstandingInvoices.count ?? 0} pending`}
              accent={CORAL}
            />
            <StatCard
              label="Teacher Cost"
              value={stats ? fmtHKD(stats.monthlyTeacherCost) : '—'}
              sub="this month"
              accent={INK2}
            />
          </>
        )}
      </div>

      {/* ── Mobile: Recent Activity (hidden on md+) ── */}
      <div className="md:hidden" style={{ marginBottom: 20 }}>
        <ActivityPanel events={activity} loading={loadingActivity} />
      </div>

      {/* ── Desktop: two-column layout (hidden on mobile) ── */}
      <div className="hidden md:grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 20, alignItems: 'start' }}>
        <TodayPanel
          sessions={todaySessions}
          loading={loadingToday}
          todayLabel={todayLabel}
          onSelect={setSelectedSession}
        />
        <ActivityPanel events={activity} loading={loadingActivity} />
      </div>

      {/* Session detail modal */}
      {selectedSession && (
        <SessionModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}

      {/* ── Dev reset ── */}
      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <button
          onClick={() => resetMutation.mutate(undefined)}
          disabled={resetMutation.isPending}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D1D5DB', fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'color .15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = INK3)}
          onMouseLeave={e => (e.currentTarget.style.color = '#D1D5DB')}
        >
          <RefreshCw size={11} />
          {resetMutation.isPending ? 'Resetting…' : 'Reset Demo Data'}
        </button>
      </div>
    </div>
  )
}
