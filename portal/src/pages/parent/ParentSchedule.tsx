import { useState, useMemo, useEffect } from 'react'
import {
  format, startOfMonth, getDaysInMonth, getDay,
  addMonths, subMonths, addDays, startOfWeek, getISOWeek,
} from 'date-fns'
import toast from 'react-hot-toast'
import { useParentSessions } from '../../hooks/parent'
import type { CalendarSession } from '../../hooks/parent'
import ClassroomBG from '../../components/ui/ClassroomBG'
import Glass from '../../components/ui/Glass'
import GradPill from '../../components/ui/GradPill'
import Icon from '../../components/ui/Icon'
import Mascot from '../../components/ui/Mascot'
import Pill from '../../components/ui/Pill'
import BottomNav from '../../components/nav/BottomNav'
import { BB } from '../../lib/bb'
import { R } from '../../lib/routes'

type ViewMode = 'week' | 'month'

const PARENT_TABS = [
  { key: 'home',  path: R.PARENT_DASHBOARD, icon: 'home',     label: 'Home'     },
  { key: 'sched', path: R.PARENT_SCHEDULE,  icon: 'calendar', label: 'Schedule' },
  { key: 'inv',   path: R.PARENT_INVOICE,   icon: 'doc',      label: 'Invoice'  },
  { key: 'prof',  path: R.PARENT_PROFILE,   icon: 'user',     label: 'Profile'  },
]

const DAY_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const DAY_SHORT   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// Week grid constants
const GRID_START = 9    // 9 am
const GRID_END   = 21   // 9 pm
const HOUR_H     = 72   // px per hour
const TIME_COL   = 52   // px for time label column
const HOURS      = Array.from({ length: GRID_END - GRID_START }, (_, i) => i + GRID_START)
const TOTAL_H    = (GRID_END - GRID_START) * HOUR_H

interface CalendarCell {
  dayNum: number
  inMonth: boolean
  dateStr: string
  daySessions: CalendarSession[]
  isToday: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

/** Parse "10:00 AM" / "2:30 PM" → { h, m } in 24-hour */
function parseHKTime(displayTime: string): { h: number; m: number } {
  const parts = displayTime.trim().split(' ')
  const [hStr, mStr] = parts[0].split(':')
  let h = parseInt(hStr, 10)
  const m = parseInt(mStr ?? '0', 10)
  if (parts[1] === 'PM' && h !== 12) h += 12
  if (parts[1] === 'AM' && h === 12) h = 0
  return { h, m }
}

function sessionMins(s: CalendarSession): number {
  const { h, m } = parseHKTime(s.displayTime)
  return h * 60 + m
}

function fmtHourLabel(h: number) {
  if (h === 12) return '12pm'
  if (h > 12)   return `${h - 12}pm`
  return `${h}am`
}

function getMonday(d: Date): Date {
  return startOfWeek(d, { weekStartsOn: 1 })
}

function weekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

// Greedy column-assignment for overlapping sessions within one day
function columnLayout(daySessions: CalendarSession[]) {
  const sorted = [...daySessions].sort((a, b) => sessionMins(a) - sessionMins(b))
  const result: { s: CalendarSession; col: number; totalCols: number }[] = []

  for (const s of sorted) {
    const start = sessionMins(s)
    const end   = start + s.durationMin
    let col = 0
    while (result.some(r =>
      r.col === col
      && sessionMins(r.s) < end
      && sessionMins(r.s) + r.s.durationMin > start
    )) {
      col++
    }
    result.push({ s, col, totalCols: 1 })
  }

  // patch totalCols
  for (const item of result) {
    const start = sessionMins(item.s)
    const end   = start + item.s.durationMin
    const maxCol = Math.max(
      item.col,
      ...result
        .filter(r => r.s !== item.s
          && sessionMins(r.s) < end
          && sessionMins(r.s) + r.s.durationMin > start)
        .map(r => r.col),
    )
    item.totalCols = maxCol + 1
  }

  return result
}

// ─── Slot picker ──────────────────────────────────────────────────────────────

interface SlotItem {
  id: string
  dateLabel: string
  timeLabel: string
  teacherName: string
  teacherColor: string
}

const SLOT_OFFSETS = [
  { offset: 2,  hour: 10, primary: true  },
  { offset: 3,  hour: 14, primary: true  },
  { offset: 5,  hour: 10, primary: true  },
  { offset: 7,  hour: 11, primary: false },
  { offset: 9,  hour: 10, primary: true  },
  { offset: 12, hour: 14, primary: true  },
  { offset: 14, hour: 10, primary: true  },
  { offset: 16, hour: 15, primary: false },
  { offset: 19, hour: 10, primary: true  },
  { offset: 21, hour: 14, primary: true  },
]

function fmtHour(h: number) {
  if (h === 12) return '12:00 PM'
  return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`
}

function generateSlots(primaryTeacher: string, primaryColor: string): SlotItem[] {
  const altTeacher = primaryColor === '#F5C842'
    ? { name: 'Gwen Torres', color: '#06D6A0' }
    : { name: 'Beverly Wong', color: '#F5C842' }

  return SLOT_OFFSETS.map((s, i) => {
    const d = new Date()
    d.setDate(d.getDate() + s.offset)
    const teacher = s.primary
      ? { name: primaryTeacher, color: primaryColor }
      : altTeacher
    return {
      id: `slot-${i}`,
      dateLabel: d.toLocaleDateString('en-HK', { weekday: 'short', day: 'numeric', month: 'short' }),
      timeLabel: fmtHour(s.hour),
      teacherName: teacher.name,
      teacherColor: teacher.color,
    }
  })
}

function SlotPickerSheet({
  session, onClose, onConfirm,
}: {
  session: CalendarSession
  onClose: () => void
  onConfirm: (slot: SlotItem) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const slots = useMemo(
    () => generateSlots(session.teacher, session.color),
    [session.teacher, session.color],
  )
  const selectedSlot = slots.find(s => s.id === selected)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,.48)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 560, margin: '0 auto',
          background: '#fff', borderRadius: '24px 24px 0 0',
          maxHeight: '88dvh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -8px 40px rgba(0,0,0,.18)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: '#E5E7EB' }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '12px 20px 14px',
          borderBottom: '1px solid #F3F0EB',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: `${session.color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Mascot kind={session.mascot} size={30} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: BB.ink, letterSpacing: -0.3 }}>Book a Session</div>
            <div style={{ fontSize: 12, color: BB.inkSoft, marginTop: 1 }}>
              {session.programme} · {session.teacher}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 99,
              background: '#F3F0EB', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 16, color: BB.inkSoft,
            }}
          >
            ✕
          </button>
        </div>

        {/* Section label */}
        <div style={{ padding: '14px 20px 6px' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: BB.inkMute, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Available in the next 30 days
          </div>
        </div>

        {/* Slots */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {slots.map(slot => {
            const isSel = selected === slot.id
            return (
              <button
                key={slot.id}
                onClick={() => setSelected(id => id === slot.id ? null : slot.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 16px', borderRadius: 16,
                  border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%',
                  background: isSel ? `${slot.teacherColor}15` : '#F9F8F6',
                  outline: isSel ? `2px solid ${slot.teacherColor}` : '2px solid transparent',
                  transition: 'all .15s',
                }}
              >
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: slot.teacherColor, flexShrink: 0,
                  boxShadow: `0 0 0 3px ${slot.teacherColor}30`,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: BB.ink }}>{slot.dateLabel}</div>
                  <div style={{ fontSize: 12, color: BB.inkSoft, marginTop: 1 }}>{slot.teacherName}</div>
                </div>
                <div style={{
                  padding: '7px 16px', borderRadius: 999,
                  background: isSel ? slot.teacherColor : '#fff',
                  color: isSel ? '#fff' : BB.ink,
                  fontSize: 14, fontWeight: 800,
                  boxShadow: isSel ? `0 4px 12px ${slot.teacherColor}55` : '0 1px 4px rgba(0,0,0,.10)',
                  transition: 'all .15s', flexShrink: 0,
                }}>
                  {slot.timeLabel}
                </div>
              </button>
            )
          })}
        </div>

        {/* Confirm bar */}
        <div style={{ padding: '12px 20px 32px', borderTop: '1px solid #F3F0EB' }}>
          <GradPill
            size="md"
            style={{
              width: '100%', justifyContent: 'center',
              opacity: selected ? 1 : 0.45,
              pointerEvents: selected ? 'auto' : 'none',
            }}
            onClick={() => selectedSlot && onConfirm(selectedSlot)}
          >
            {selected
              ? `Confirm · ${selectedSlot?.dateLabel} · ${selectedSlot?.timeLabel}`
              : 'Select a time above'}
          </GradPill>
        </div>
      </div>
    </div>
  )
}

// ─── Week View ────────────────────────────────────────────────────────────────

function WeekView({ sessions, cursor, onSelect }: {
  sessions: CalendarSession[]
  cursor: Date
  onSelect: (s: CalendarSession) => void
}) {
  const monday = getMonday(cursor)
  const days   = weekDays(monday)
  const today  = new Date()

  const sessionsByDay = useMemo(() => {
    return days.map(d => {
      const ds = format(d, 'yyyy-MM-dd')
      return sessions.filter(s => s.date === ds)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, format(monday, 'yyyy-MM-dd')])

  return (
    <div style={{
      background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(16px)',
      borderRadius: 16, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,.6)', marginTop: 10,
    }}>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 360, display: 'flex', flexDirection: 'column' }}>

          {/* Column headers */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,.08)', background: 'rgba(255,255,255,.5)' }}>
            <div style={{ width: TIME_COL, flexShrink: 0 }} />
            {days.map((d, i) => {
              const isToday = isSameDay(d, today)
              return (
                <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: BB.inkMute, textTransform: 'uppercase' }}>
                    {DAY_SHORT[i]}
                  </div>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    margin: '2px auto 0',
                    background: isToday ? BB.amber : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 13, fontWeight: isToday ? 800 : 600, color: isToday ? '#fff' : BB.ink }}>
                      {d.getDate()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Body: time labels + 7 day columns */}
          <div style={{ display: 'flex', height: TOTAL_H }}>

            {/* Time label column */}
            <div style={{ width: TIME_COL, flexShrink: 0, position: 'relative' }}>
              {HOURS.map(h => (
                <div
                  key={h}
                  style={{
                    position: 'absolute',
                    top: (h - GRID_START) * HOUR_H + 2,
                    right: 6,
                    fontSize: 11, fontWeight: 600, color: BB.inkMute, lineHeight: 1,
                  }}
                >
                  {fmtHourLabel(h)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((d, colIdx) => {
              const layout  = columnLayout(sessionsByDay[colIdx] ?? [])
              const isToday = isSameDay(d, today)

              return (
                <div
                  key={colIdx}
                  style={{
                    flex: 1, minWidth: 0, position: 'relative',
                    borderLeft: '1px solid rgba(0,0,0,.05)',
                    background: isToday ? `${BB.amber}07` : 'transparent',
                  }}
                >
                  {/* Hour grid lines */}
                  {HOURS.map(h => (
                    <div
                      key={h}
                      style={{
                        position: 'absolute',
                        top: (h - GRID_START) * HOUR_H,
                        left: 0, right: 0,
                        borderTop: '1px solid rgba(0,0,0,.06)',
                        pointerEvents: 'none',
                      }}
                    />
                  ))}

                  {/* Session blocks */}
                  {layout.map(({ s, col, totalCols }) => {
                    const { h: hktHour, m: hktMin } = parseHKTime(s.displayTime)
                    const topPx    = (hktHour - GRID_START) * HOUR_H + (hktMin / 60) * HOUR_H
                    const heightPx = Math.max((s.durationMin / 60) * HOUR_H - 3, 16)
                    const pctW     = 100 / totalCols
                    const pctL     = col * pctW

                    return (
                      <div
                        key={s.id}
                        onClick={() => onSelect(s)}
                        title={`${s.studentName} · ${s.programme} · ${s.displayTime}`}
                        style={{
                          position: 'absolute',
                          top: topPx,
                          left: `calc(${pctL}% + 1px)`,
                          width: `calc(${pctW}% - 3px)`,
                          height: heightPx,
                          background: s.color,
                          opacity: s.status === 'COMPLETED' ? 0.55 : 0.9,
                          borderRadius: 5, padding: '3px 4px', overflow: 'hidden',
                          cursor: 'pointer',
                          boxShadow: '0 1px 5px rgba(0,0,0,.18)',
                          zIndex: 2,
                        }}
                      >
                        <div style={{
                          fontSize: 11, fontWeight: 800, color: '#fff',
                          lineHeight: 1.3, overflow: 'hidden',
                          whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                        }}>
                          {s.studentName?.split(' ')[0] ?? s.programme}
                        </div>
                        {heightPx > 32 && (
                          <div style={{
                            fontSize: 10, color: 'rgba(255,255,255,.88)',
                            lineHeight: 1.2, overflow: 'hidden',
                            whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                          }}>
                            {s.programme}
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ParentSchedule() {
  const [viewMode, setViewMode]       = useState<ViewMode>('month')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [cursor, setCursor]           = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [filterProg, setFilterProg]   = useState<string | null>(null)
  const [bookingSession, setBookingSession] = useState<CalendarSession | null>(null)
  useEffect(() => { document.title = 'Schedule — Our Learning Portal' }, [])

  // Keep currentMonth in sync with week cursor when in week view
  useEffect(() => {
    if (viewMode === 'week') {
      const monday = getMonday(cursor)
      const mm = format(monday, 'yyyy-MM')
      const cm = format(currentMonth, 'yyyy-MM')
      if (mm !== cm) {
        setCurrentMonth(new Date(monday.getFullYear(), monday.getMonth(), 1))
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, viewMode])

  const monthStr = format(currentMonth, 'yyyy-MM')
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const { data: sessions = [], isLoading } = useParentSessions(monthStr)

  const programmes = useMemo(() => {
    const seen = new Map<string, string>()
    sessions.forEach(s => { if (!seen.has(s.programme)) seen.set(s.programme, s.color) })
    return Array.from(seen.entries()).map(([name, color]) => ({ name, color }))
  }, [sessions])

  const filtered = useMemo(
    () => filterProg ? sessions.filter(s => s.programme === filterProg) : sessions,
    [sessions, filterProg]
  )

  // ── Month view data ───────────────────────────────────────────────────────

  const cells = useMemo<CalendarCell[]>(() => {
    const firstDay = startOfMonth(currentMonth)
    const daysInMonth = getDaysInMonth(currentMonth)
    const offset = (getDay(firstDay) + 6) % 7

    return Array.from({ length: 42 }, (_, i) => {
      const dayNum = i - offset + 1
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth
      if (!inMonth) {
        return { dayNum, inMonth: false, dateStr: '', daySessions: [], isToday: false }
      }
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum)
      const dateStr = format(date, 'yyyy-MM-dd')
      return {
        dayNum, inMonth: true, dateStr,
        daySessions: filtered.filter(s => s.date === dateStr),
        isToday: dateStr === todayStr,
      }
    })
  }, [currentMonth, filtered, todayStr])

  const lastMonthIdx = cells.reduce((acc, c, i) => c.inMonth ? i : acc, -1)
  const visibleCells = cells.slice(0, Math.ceil((lastMonthIdx + 1) / 7) * 7)

  const selectedSessions = selectedDate
    ? filtered.filter(s => s.date === selectedDate)
    : []

  // ── Navigation ────────────────────────────────────────────────────────────

  function handleMonthChange(dir: 1 | -1) {
    setCurrentMonth(m => dir === 1 ? addMonths(m, 1) : subMonths(m, 1))
    setSelectedDate(null)
  }

  function handleWeekChange(dir: 1 | -1) {
    setCursor(prev => addDays(prev, dir * 7))
  }

  function handleDayClick(cell: CalendarCell) {
    if (!cell.inMonth) return
    setSelectedDate(prev => prev === cell.dateStr ? null : cell.dateStr)
  }

  function handleBookConfirm(slot: SlotItem) {
    setBookingSession(null)
    toast.success(`Booked! ${slot.dateLabel} · ${slot.timeLabel} ✓`)
  }

  // ── Week nav label ────────────────────────────────────────────────────────

  const weekNavLabel = useMemo(() => {
    const ws = getMonday(cursor)
    const we = addDays(ws, 6)
    const weekNum = getISOWeek(ws)
    if (ws.getMonth() === we.getMonth()) {
      return `W${weekNum} · ${ws.getDate()}–${we.getDate()} ${MONTH_NAMES[ws.getMonth()]} ${ws.getFullYear()}`
    }
    return `W${weekNum} · ${ws.getDate()} ${MONTH_NAMES[ws.getMonth()]} – ${we.getDate()} ${MONTH_NAMES[we.getMonth()]}`
  }, [cursor])

  // ── Session detail handler (week view) ───────────────────────────────────

  function handleWeekSessionClick(s: CalendarSession) {
    setBookingSession(s)
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <ClassroomBG seed={11} />
      <div className="relative flex flex-col min-h-screen">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 relative z-10">
          <div style={{ fontSize: 20, fontWeight: 800, color: BB.ink, letterSpacing: -0.3 }}>Schedule</div>

          {/* View mode toggle */}
          <div style={{
            display: 'inline-flex', background: 'rgba(255,255,255,.62)',
            borderRadius: 10, padding: 3, backdropFilter: 'blur(10px)', gap: 1,
          }}>
            {(['week', 'month'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                style={{
                  height: 30, padding: '0 12px', borderRadius: 8, border: 'none',
                  background: viewMode === v ? BB.amber : 'transparent',
                  color: viewMode === v ? '#fff' : BB.inkSoft,
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  transition: 'all .15s', textTransform: 'capitalize',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-28 relative z-10">

          {/* ── Filter chips ── */}
          {programmes.length > 0 && (
            <div className="flex gap-2 mt-1 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setFilterProg(null)}
                style={{
                  flexShrink: 0, height: 32, padding: '0 14px', borderRadius: 999, border: 'none',
                  background: !filterProg ? BB.ink : 'rgba(255,255,255,.72)',
                  backdropFilter: 'blur(10px)',
                  color: !filterProg ? '#fff' : BB.ink,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  boxShadow: !filterProg ? 'none' : 'inset 0 0 0 1px rgba(0,0,0,.08)',
                }}
              >
                All classes
              </button>
              {programmes.map(p => (
                <button
                  key={p.name}
                  onClick={() => setFilterProg(prev => prev === p.name ? null : p.name)}
                  style={{
                    flexShrink: 0, height: 32, padding: '0 14px', borderRadius: 999, border: 'none',
                    background: filterProg === p.name ? p.color : 'rgba(255,255,255,.72)',
                    backdropFilter: 'blur(10px)',
                    color: filterProg === p.name ? '#fff' : BB.ink,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    boxShadow: filterProg === p.name ? `0 4px 14px ${p.color}66` : 'inset 0 0 0 1px rgba(0,0,0,.08)',
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {/* ══════════════════ WEEK VIEW ══════════════════ */}
          {viewMode === 'week' && (
            <>
              {/* Week navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <button
                  onClick={() => handleWeekChange(-1)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,255,255,.65)',
                    border: '1px solid rgba(255,255,255,.6)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <Icon name="chev-l" size={16} color={BB.ink} />
                </button>

                <div
                  onClick={() => { setCursor(new Date()) }}
                  title="Tap to return to today"
                  style={{
                    flex: 1, textAlign: 'center',
                    fontSize: 13, fontWeight: 700, color: BB.ink,
                    cursor: 'pointer', padding: '6px 0', borderRadius: 10,
                    background: 'rgba(255,255,255,.45)', backdropFilter: 'blur(8px)',
                  }}
                >
                  {weekNavLabel}
                </div>

                <button
                  onClick={() => handleWeekChange(1)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(255,255,255,.65)',
                    border: '1px solid rgba(255,255,255,.6)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <Icon name="chev-r" size={16} color={BB.ink} />
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-7 h-7 border-2 border-[#F5C842] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <WeekView
                  sessions={filtered}
                  cursor={cursor}
                  onSelect={handleWeekSessionClick}
                />
              )}
            </>
          )}

          {/* ══════════════════ MONTH VIEW ══════════════════ */}
          {viewMode === 'month' && (
            <>
              {/* ── Calendar card ── */}
              <Glass padding={16} style={{ marginTop: 0 }}>

                {/* Month navigation */}
                <div className="flex items-center justify-between mb-5">
                  <button
                    onClick={() => handleMonthChange(-1)}
                    style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(0,0,0,.06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Icon name="chev-l" size={17} color={BB.ink} />
                  </button>
                  <div style={{ fontSize: 17, fontWeight: 800, color: BB.ink, letterSpacing: -0.2 }}>
                    {format(currentMonth, 'MMMM yyyy')}
                  </div>
                  <button
                    onClick={() => handleMonthChange(1)}
                    style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(0,0,0,.06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Icon name="chev-r" size={17} color={BB.ink} />
                  </button>
                </div>

                {/* Day-of-week headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 2 }}>
                  {DAY_HEADERS.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: BB.inkMute, paddingBottom: 8 }}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-7 h-7 border-2 border-[#F5C842] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                    {visibleCells.map((cell, i) => {
                      const isSelected = cell.dateStr === selectedDate
                      return (
                        <div
                          key={i}
                          onClick={() => handleDayClick(cell)}
                          style={{
                            minHeight: 50, borderRadius: 10, padding: '4px 2px 5px',
                            cursor: cell.inMonth ? 'pointer' : 'default',
                            background: isSelected ? `${BB.amber}28` : 'transparent',
                            border: isSelected ? `1.5px solid ${BB.amber}` : '1.5px solid transparent',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                            transition: 'background .15s, border .15s',
                          }}
                        >
                          {cell.inMonth && (
                            <>
                              <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: cell.isToday ? BB.coral : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13, fontWeight: cell.isToday ? 800 : 500,
                                color: cell.isToday ? '#fff' : BB.ink,
                              }}>
                                {cell.dayNum}
                              </div>
                              <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', minHeight: 8 }}>
                                {cell.daySessions.slice(0, 3).map((s, j) => (
                                  <div key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Legend */}
                {programmes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,.06)' }}>
                    {programmes.map(p => (
                      <div key={p.name} className="flex items-center gap-1.5">
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: BB.inkSoft }}>{p.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Glass>

              {/* ── Selected day detail ── */}
              {selectedDate && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: BB.inkSoft, letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>
                    {format(new Date(`${selectedDate}T12:00:00`), 'EEEE, d MMMM')}
                  </div>

                  {selectedSessions.length === 0 ? (
                    <Glass padding={22} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 30 }}>😴</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: BB.ink, marginTop: 8 }}>No classes this day</div>
                      <div style={{ fontSize: 12, color: BB.inkSoft, marginTop: 4 }}>
                        {filterProg ? `No ${filterProg} classes` : 'Nothing scheduled'}
                      </div>
                    </Glass>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {selectedSessions.map(s => (
                        <Glass key={s.id} padding={0} style={{ overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'stretch' }}>
                            {/* Colour bar */}
                            <div style={{ width: 5, background: s.color, flexShrink: 0 }} />
                            <div style={{ flex: 1, padding: '14px 14px 14px 12px' }}>
                              {/* Top row: mascot + info + status badges */}
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                <Mascot kind={s.mascot} size={38} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 14, fontWeight: 800, color: BB.ink }}>{s.programme}</div>
                                  <div style={{ fontSize: 12, color: BB.inkSoft, marginTop: 1 }}>
                                    {s.displayTime} · {s.durationMin} min
                                  </div>
                                  <div style={{ fontSize: 12, color: BB.inkSoft }}>with {s.teacher}</div>
                                  <div style={{ fontSize: 11, color: BB.inkMute }}>{s.studentName}</div>
                                </div>
                                {/* Status + Book button column */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                                  <Pill color={
                                    s.status === 'COMPLETED' ? BB.green
                                    : s.status === 'CANCELLED' ? BB.inkMute
                                    : BB.teal
                                  }>
                                    {s.status === 'COMPLETED' ? '✓ Done'
                                      : s.status === 'SCHEDULED' ? 'Upcoming'
                                      : s.status}
                                  </Pill>
                                  {/* Book button — only for upcoming classes */}
                                  {s.status === 'SCHEDULED' && (
                                    <button
                                      onClick={() => setBookingSession(s)}
                                      style={{
                                        padding: '5px 12px', borderRadius: 999,
                                        border: `1.5px solid ${s.color}`,
                                        background: `${s.color}12`,
                                        color: s.color,
                                        fontSize: 12, fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 5,
                                        transition: 'all .15s',
                                      }}
                                    >
                                      <Icon name="plus" size={11} color={s.color} /> Book
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Glass>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Empty month state ── */}
              {!isLoading && sessions.length === 0 && (
                <Glass padding={28} style={{ textAlign: 'center', marginTop: 16 }}>
                  <div style={{ fontSize: 36 }}>📅</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: BB.ink, marginTop: 10 }}>No classes in {format(currentMonth, 'MMMM')}</div>
                  <div style={{ fontSize: 13, color: BB.inkSoft, marginTop: 6 }}>
                    Select a day to see your classes and book a session
                  </div>
                </Glass>
              )}
            </>
          )}

        </div>

        <BottomNav tabs={PARENT_TABS} />
      </div>

      {/* ── Book a session sheet ── */}
      {bookingSession && (
        <SlotPickerSheet
          session={bookingSession}
          onClose={() => setBookingSession(null)}
          onConfirm={handleBookConfirm}
        />
      )}
    </div>
  )
}
