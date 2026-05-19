import { useState, useMemo, useEffect } from 'react'
import {
  getMockCalendarSessions, getMonday, addDays, toDateStr,
  MOCK_TEACHERS,
} from '../../lib/mock/data'
import type { CalendarSessionData } from '../../lib/mock/data'
import { useAuth } from '../../context/AuthContext'
import ClassroomBG from '../../components/ui/ClassroomBG'
import Glass from '../../components/ui/Glass'
import Icon from '../../components/ui/Icon'
import BottomNav from '../../components/nav/BottomNav'
import { BB } from '../../lib/bb'
import { R } from '../../lib/routes'

type ViewMode = 'day' | 'week' | 'month'
type Filter = 'mine' | 'all'

const TEACHER_TABS = [
  { key: 'home',  path: R.TEACHER_DASHBOARD,    icon: 'home',     label: 'Home'         },
  { key: 'cls',   path: R.TEACHER_CLASSES,      icon: 'calendar', label: 'Classes'      },
  { key: 'avail', path: R.TEACHER_AVAILABILITY, icon: 'clock',    label: 'Availability' },
  { key: 'pay',   path: R.TEACHER_PAYSLIP,      icon: 'card',     label: 'Payslip'      },
]

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const GRID_START = 9   // 9 am
const GRID_END   = 21  // 9 pm
const HOUR_H     = 72  // px per hour in week grid

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

function fmtHour(h: number) {
  if (h === 12) return '12pm'
  if (h > 12)   return `${h - 12}pm`
  return `${h}am`
}

function weekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

// Greedy column-assignment for overlapping sessions within one day
function columnLayout(daySessions: CalendarSessionData[]) {
  const sorted = [...daySessions].sort(
    (a, b) => a.hktHour * 60 + a.hktMin - (b.hktHour * 60 + b.hktMin)
  )
  const result: { s: CalendarSessionData; col: number; totalCols: number }[] = []

  for (const s of sorted) {
    const start = s.hktHour * 60 + s.hktMin
    const end   = start + s.durationMin
    let col = 0
    // find first free column
    while (result.some(r => r.col === col
      && r.s.hktHour * 60 + r.s.hktMin < end
      && r.s.hktHour * 60 + r.s.hktMin + r.s.durationMin > start)) {
      col++
    }
    result.push({ s, col, totalCols: 1 })
  }

  // patch totalCols
  for (const item of result) {
    const start = item.s.hktHour * 60 + item.s.hktMin
    const end   = start + item.s.durationMin
    const maxCol = Math.max(
      item.col,
      ...result
        .filter(r => r.s !== item.s
          && r.s.hktHour * 60 + r.s.hktMin < end
          && r.s.hktHour * 60 + r.s.hktMin + r.s.durationMin > start)
        .map(r => r.col),
    )
    item.totalCols = maxCol + 1
  }

  return result
}

// ─── Detail bottom sheet ──────────────────────────────────────────────────────

function DetailSheet({ s, onClose }: { s: CalendarSessionData; onClose: () => void }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', borderRadius: '24px 24px 0 0', background: '#FAF9F6', maxHeight: '72vh', overflowY: 'auto', padding: '20px 20px 52px' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 4, borderRadius: 999, background: 'rgba(0,0,0,.12)', margin: '0 auto 20px' }} />
        <div style={{ height: 5, borderRadius: 3, background: s.programme.color, marginBottom: 18 }} />
        <div style={{ fontSize: 19, fontWeight: 800, color: BB.ink, marginBottom: 2 }}>{s.programme.name}</div>
        <div style={{ fontSize: 13, color: BB.inkSoft, marginBottom: 18 }}>with {s.student.name}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: 'calendar', text: `${s.displayDate} · ${s.displayTime}` },
            { icon: 'clock',    text: `${s.durationMin} minutes` },
            { icon: 'users',    text: s.teacher.name },
          ].map(({ icon, text }) => (
            <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(0,0,0,.04)' }}>
              <Icon name={icon} size={15} color={BB.teal} />
              <span style={{ fontSize: 14, fontWeight: 600, color: BB.ink }}>{text}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(0,0,0,.04)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.status === 'COMPLETED' ? BB.green : BB.teal, flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: BB.ink }}>{s.status === 'COMPLETED' ? 'Completed' : 'Scheduled'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Day View ─────────────────────────────────────────────────────────────────

function DayView({ sessions, date, onSelect }: {
  sessions: CalendarSessionData[]
  date: Date
  onSelect: (s: CalendarSessionData) => void
}) {
  const ds = toDateStr(date)
  const daySessions = sessions
    .filter(s => s.dateStr === ds)
    .sort((a, b) => a.hktHour * 60 + a.hktMin - (b.hktHour * 60 + b.hktMin))

  if (daySessions.length === 0) {
    return (
      <Glass padding={28} style={{ textAlign: 'center', marginTop: 10 }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: BB.ink }}>No classes this day</div>
        <div style={{ fontSize: 13, color: BB.inkSoft, marginTop: 4 }}>Schedule is clear</div>
      </Glass>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
      {daySessions.map(s => (
        <div
          key={s.id}
          onClick={() => onSelect(s)}
          style={{ borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,.78)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.6)', boxShadow: '0 2px 12px rgba(40,30,10,.07)', display: 'flex', cursor: 'pointer' }}
        >
          <div style={{ width: 5, background: s.programme.color, flexShrink: 0 }} />
          <div style={{ flex: 1, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: BB.ink }}>{s.programme.name}</div>
                <div style={{ fontSize: 13, color: BB.inkSoft }}>{s.student.name}</div>
                <div style={{ fontSize: 12, color: BB.inkMute, marginTop: 2 }}>
                  {s.displayTime} · {s.durationMin}m · {s.teacher.name}
                </div>
              </div>
              <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: s.status === 'COMPLETED' ? '#ECFDF5' : `${BB.teal}18`, color: s.status === 'COMPLETED' ? BB.green : BB.teal }}>
                {s.status === 'COMPLETED' ? '✓ Done' : 'Scheduled'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Week View ────────────────────────────────────────────────────────────────

const TIME_COL  = 52   // width of time label column in px
const HOURS     = Array.from({ length: GRID_END - GRID_START }, (_, i) => i + GRID_START)
const TOTAL_H   = (GRID_END - GRID_START) * HOUR_H

function WeekView({ sessions, date, onSelect }: {
  sessions: CalendarSessionData[]
  date: Date
  onSelect: (s: CalendarSessionData) => void
}) {
  const monday = getMonday(date)
  const days   = weekDays(monday)
  const today  = new Date()

  const sessionsByDay = useMemo(() => {
    return days.map(d => sessions.filter(s => s.dateStr === toDateStr(d)))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, toDateStr(monday)])

  return (
    <div style={{ background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(16px)', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,.6)', marginTop: 10 }}>
      <div style={{ overflowX: 'auto' }}>
        {/* minWidth keeps it scrollable on very narrow screens */}
        <div style={{ minWidth: 360, display: 'flex', flexDirection: 'column' }}>

          {/* Column headers — flex so they fill 100% width */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,.08)', background: 'rgba(255,255,255,.5)' }}>
            <div style={{ width: TIME_COL, flexShrink: 0 }} />
            {days.map((d, i) => {
              const isToday = isSameDay(d, today)
              return (
                <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: BB.inkMute, textTransform: 'uppercase' }}>{DAY_SHORT[i]}</div>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', margin: '2px auto 0', background: isToday ? BB.teal : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: isToday ? 800 : 600, color: isToday ? '#fff' : BB.ink }}>
                      {d.getDate()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Body: time labels + 7 day columns side by side */}
          <div style={{ display: 'flex', height: TOTAL_H }}>

            {/* Time label column */}
            <div style={{ width: TIME_COL, flexShrink: 0, position: 'relative' }}>
              {HOURS.map(h => (
                <div key={h} style={{ position: 'absolute', top: (h - GRID_START) * HOUR_H + 2, right: 6, fontSize: 11, fontWeight: 600, color: BB.inkMute, lineHeight: 1 }}>
                  {fmtHour(h)}
                </div>
              ))}
            </div>

            {/* Day columns — each flex:1 so they share remaining width equally */}
            {days.map((d, colIdx) => {
              const layout = columnLayout(sessionsByDay[colIdx] ?? [])
              const isToday = isSameDay(d, today)

              return (
                <div key={colIdx} style={{ flex: 1, minWidth: 0, position: 'relative', borderLeft: '1px solid rgba(0,0,0,.05)', background: isToday ? `${BB.teal}07` : 'transparent' }}>
                  {/* Hour grid lines */}
                  {HOURS.map(h => (
                    <div key={h} style={{ position: 'absolute', top: (h - GRID_START) * HOUR_H, left: 0, right: 0, borderTop: '1px solid rgba(0,0,0,.06)', pointerEvents: 'none' }} />
                  ))}

                  {/* Session blocks — width/left in % so they scale with column */}
                  {layout.map(({ s, col, totalCols }) => {
                    const topPx    = (s.hktHour - GRID_START) * HOUR_H + (s.hktMin / 60) * HOUR_H
                    const heightPx = Math.max((s.durationMin / 60) * HOUR_H - 3, 16)
                    const pctW     = 100 / totalCols
                    const pctL     = col * pctW

                    return (
                      <div
                        key={s.id}
                        onClick={() => onSelect(s)}
                        title={`${s.student.name} · ${s.programme.name} · ${s.displayTime}`}
                        style={{
                          position: 'absolute',
                          top: topPx,
                          left: `calc(${pctL}% + 1px)`,
                          width:  `calc(${pctW}% - 3px)`,
                          height: heightPx,
                          background: s.programme.color,
                          opacity: s.status === 'COMPLETED' ? 0.55 : 0.9,
                          borderRadius: 5, padding: '3px 4px', overflow: 'hidden',
                          cursor: 'pointer', boxShadow: '0 1px 5px rgba(0,0,0,.18)', zIndex: 2,
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {s.student.name.split(' ')[0]}
                        </div>
                        {heightPx > 32 && (
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.88)', lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {s.programme.name}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Month View ───────────────────────────────────────────────────────────────

function MonthView({ sessions, date, onDayClick }: {
  sessions: CalendarSessionData[]
  date: Date
  onDayClick: (d: Date) => void
}) {
  const year  = date.getFullYear()
  const month = date.getMonth()
  const today = new Date()

  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)

  // Build cells (null = padding before month start)
  const startDow = (firstDay.getDay() + 6) % 7  // 0=Mon
  const cells: (Date | null)[] = [
    ...Array.from({ length: startDow }, () => null as null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(year, month, i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const byDate = useMemo(() => {
    const m: Record<string, CalendarSessionData[]> = {}
    for (const s of sessions) {
      if (!m[s.dateStr]) m[s.dateStr] = []
      m[s.dateStr].push(s)
    }
    return m
  }, [sessions])

  return (
    <div style={{ background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(16px)', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,.6)', marginTop: 10 }}>
      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid rgba(0,0,0,.08)', padding: '8px 0' }}>
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: BB.inkMute }}>{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
        {cells.map((d, i) => {
          if (!d) {
            return <div key={`pad-${i}`} style={{ height: 62, borderBottom: '1px solid rgba(0,0,0,.05)', borderRight: '1px solid rgba(0,0,0,.05)' }} />
          }
          const ds         = toDateStr(d)
          const daySess    = byDate[ds] ?? []
          const isToday    = isSameDay(d, today)
          const isCurrent  = isSameDay(d, date)

          return (
            <div
              key={ds}
              onClick={() => onDayClick(d)}
              style={{ height: 62, padding: '5px 4px 3px', borderBottom: '1px solid rgba(0,0,0,.05)', borderRight: '1px solid rgba(0,0,0,.05)', cursor: 'pointer', background: isCurrent && !isToday ? `${BB.teal}10` : 'transparent' }}
            >
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: isToday ? BB.teal : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: isToday ? 800 : 500, color: isToday ? '#fff' : BB.ink }}>{d.getDate()}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {daySess.slice(0, 5).map(s => (
                  <div key={s.id} style={{ width: 7, height: 7, borderRadius: '50%', background: s.programme.color, opacity: s.status === 'COMPLETED' ? 0.45 : 0.88 }} />
                ))}
                {daySess.length > 5 && (
                  <div style={{ fontSize: 8, color: BB.inkMute, fontWeight: 700, lineHeight: '7px' }}>+{daySess.length - 5}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TeacherClasses() {
  const { user } = useAuth()
  const [view,   setView]   = useState<ViewMode>('week')
  const [filter, setFilter] = useState<Filter>('mine')
  const [cursor, setCursor] = useState<Date>(new Date())
  const [detail, setDetail] = useState<CalendarSessionData | null>(null)

  useEffect(() => { document.title = 'Classes — Our Learning Portal' }, [])

  const myTeacherId = useMemo(
    () => MOCK_TEACHERS.find(t => t.email === user?.email)?.id ?? 't1',
    [user],
  )

  const allSessions = useMemo(() => getMockCalendarSessions(), [])

  const sessions = useMemo(
    () => filter === 'mine' ? allSessions.filter(s => s.teacher.id === myTeacherId) : allSessions,
    [allSessions, filter, myTeacherId],
  )

  function navigate(dir: number) {
    setCursor(prev => {
      const d = new Date(prev)
      if (view === 'day')        d.setDate(d.getDate() + dir)
      else if (view === 'week')  d.setDate(d.getDate() + dir * 7)
      else                       d.setMonth(d.getMonth() + dir)
      return d
    })
  }

  function handleDayClick(d: Date) {
    setCursor(d)
    setView('day')
  }

  const navLabel = useMemo(() => {
    if (view === 'day') {
      return cursor.toLocaleDateString('en-HK', { weekday: 'long', day: 'numeric', month: 'short' })
    }
    if (view === 'week') {
      const ws = getMonday(cursor)
      const we = addDays(ws, 6)
      if (ws.getMonth() === we.getMonth()) {
        return `${ws.getDate()}–${we.getDate()} ${MONTH_NAMES[ws.getMonth()]} ${ws.getFullYear()}`
      }
      return `${ws.getDate()} ${MONTH_NAMES[ws.getMonth()]} – ${we.getDate()} ${MONTH_NAMES[we.getMonth()]}`
    }
    return cursor.toLocaleDateString('en-HK', { month: 'long', year: 'numeric' })
  }, [view, cursor])

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <ClassroomBG seed={4} />
      <div className="relative flex flex-col min-h-screen">

        {/* ── Header ── */}
        <div className="px-4 pt-4 pb-2 relative z-10">
          <div style={{ fontSize: 20, fontWeight: 800, color: BB.ink, letterSpacing: -0.3, marginBottom: 10 }}>Classes</div>

          {/* View toggle + Filter toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
            <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,.62)', borderRadius: 10, padding: 3, backdropFilter: 'blur(10px)', gap: 1 }}>
              {(['day', 'week', 'month'] as ViewMode[]).map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{ height: 30, padding: '0 10px', borderRadius: 8, border: 'none', background: view === v ? BB.teal : 'transparent', color: view === v ? '#fff' : BB.inkSoft, fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all .15s', textTransform: 'capitalize' }}>
                  {v}
                </button>
              ))}
            </div>

            <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,.62)', borderRadius: 10, padding: 3, backdropFilter: 'blur(10px)', gap: 1 }}>
              {([['mine', 'My Classes'], ['all', 'All Teachers']] as [Filter, string][]).map(([f, label]) => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ height: 30, padding: '0 9px', borderRadius: 8, border: 'none', background: filter === f ? '#1A1A2E' : 'transparent', color: filter === f ? '#fff' : BB.inkSoft, fontWeight: 700, fontSize: 11, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => navigate(-1)}
              style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.65)', border: '1px solid rgba(255,255,255,.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <Icon name="chev-l" size={16} color={BB.ink} />
            </button>

            <div onClick={() => { setCursor(new Date()); }}
              style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 700, color: BB.ink, cursor: 'pointer', padding: '6px 0', borderRadius: 10, background: 'rgba(255,255,255,.45)', backdropFilter: 'blur(8px)' }}
              title="Tap to return to today">
              {navLabel}
            </div>

            <button onClick={() => navigate(1)}
              style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.65)', border: '1px solid rgba(255,255,255,.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <Icon name="chev-r" size={16} color={BB.ink} />
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-4 pb-28 relative z-10">
          {view === 'day'   && <DayView   sessions={sessions} date={cursor} onSelect={setDetail} />}
          {view === 'week'  && <WeekView  sessions={sessions} date={cursor} onSelect={setDetail} />}
          {view === 'month' && <MonthView sessions={sessions} date={cursor} onDayClick={handleDayClick} />}
        </div>

        <BottomNav tabs={TEACHER_TABS} accent={BB.teal} />
      </div>

      {detail && <DetailSheet s={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}
