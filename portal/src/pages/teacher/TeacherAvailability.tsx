import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTeacherAvailability, useSaveAvailability } from '../../hooks/teacher'
import type { ExceptionItem } from '../../hooks/teacher'
import { getMonday, addDays } from '../../lib/mock/data'
import ClassroomBG from '../../components/ui/ClassroomBG'
import Glass from '../../components/ui/Glass'
import GradPill from '../../components/ui/GradPill'
import Icon from '../../components/ui/Icon'
import BottomNav from '../../components/nav/BottomNav'
import { BB } from '../../lib/bb'
import { R } from '../../lib/routes'

const TEACHER_TABS = [
  { key: 'home',  path: R.TEACHER_DASHBOARD,    icon: 'home',     label: 'Home'         },
  { key: 'cls',   path: R.TEACHER_CLASSES,      icon: 'calendar', label: 'Classes'      },
  { key: 'avail', path: R.TEACHER_AVAILABILITY, icon: 'clock',    label: 'Availability' },
  { key: 'pay',   path: R.TEACHER_PAYSLIP,      icon: 'card',     label: 'Payslip'      },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// 9:00 → 19:30 in 30-min steps
const SLOTS: string[] = []
for (let h = 9; h < 20; h++) {
  SLOTS.push(`${String(h).padStart(2, '0')}:00`)
  if (h < 19) SLOTS.push(`${String(h).padStart(2, '0')}:30`)
}
SLOTS.push('19:30')

const MIN_OFFSET = -2  // can go 2 weeks back
const MAX_OFFSET = 8   // can plan 8 weeks ahead

type WeekPattern = Record<number, Set<string>>

function clonePattern(p: WeekPattern): WeekPattern {
  const out: WeekPattern = {}
  for (const [k, v] of Object.entries(p)) {
    out[Number(k)] = new Set(v)
  }
  return out
}

function fmtExDate(ex: ExceptionItem): string {
  return ex.startDate === ex.endDate ? ex.startDate : `${ex.startDate} – ${ex.endDate}`
}

function fmtWeekRange(offset: number): string {
  const monday  = addDays(getMonday(new Date()), offset * 7)
  const sunday  = addDays(monday, 6)
  const mDay    = monday.getDate()
  const mMon    = MONTH_SHORT[monday.getMonth()]
  const sDay    = sunday.getDate()
  const sMon    = MONTH_SHORT[sunday.getMonth()]
  if (monday.getMonth() === sunday.getMonth()) return `${mDay}–${sDay} ${mMon} ${monday.getFullYear()}`
  return `${mDay} ${mMon} – ${sDay} ${sMon} ${sunday.getFullYear()}`
}

function weekDates(offset: number): Date[] {
  const monday = addDays(getMonday(new Date()), offset * 7)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

export default function TeacherAvailability() {
  const navigate = useNavigate()
  const { data: availData, isLoading } = useTeacherAvailability()
  const saveMutation = useSaveAvailability()

  // Base recurring pattern (loaded from server, applied to all weeks by default)
  const [basePattern, setBasePattern] = useState<WeekPattern>({})

  // Per-week overrides: offset → day-slot map
  const [weekOverrides, setWeekOverrides] = useState<Record<number, WeekPattern>>({})

  const [weekOffset, setWeekOffset] = useState(0)
  const [exceptions,  setExceptions]  = useState<ExceptionItem[]>([])
  const [saved, setSaved] = useState(false)

  // Exception modal state
  const [showExModal, setShowExModal] = useState(false)
  const [exStartDate, setExStartDate] = useState('')
  const [exEndDate,   setExEndDate]   = useState('')
  const [exLabel,     setExLabel]     = useState('')

  // Seed from API on load
  useEffect(() => {
    if (!availData) return
    const p: WeekPattern = {}
    for (const [day, slots] of Object.entries(availData.weeklyPattern)) {
      p[Number(day)] = new Set(slots)
    }
    setBasePattern(p)
    setExceptions(availData.exceptions)
  }, [availData])

  // Active pattern: week-specific override if set, otherwise base pattern
  const activePattern = useMemo(
    () => weekOverrides[weekOffset] ?? basePattern,
    [weekOverrides, weekOffset, basePattern],
  )

  // Dates for the current week's column headers
  const currentWeekDates = useMemo(() => weekDates(weekOffset), [weekOffset])

  function getOrInitWeek(): WeekPattern {
    return weekOverrides[weekOffset] ?? clonePattern(basePattern)
  }

  const toggleSlot = useCallback((dayIdx: number, slot: string) => {
    setWeekOverrides(prev => {
      const week = prev[weekOffset] ?? clonePattern(basePattern)
      const slots = new Set(week[dayIdx] ?? [])
      if (slots.has(slot)) { slots.delete(slot) } else { slots.add(slot) }
      return { ...prev, [weekOffset]: { ...week, [dayIdx]: slots } }
    })
    setSaved(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset, basePattern])

  const toggleAllDay = useCallback((dayIdx: number) => {
    setWeekOverrides(prev => {
      const week = prev[weekOffset] ?? clonePattern(basePattern)
      const allSelected = (week[dayIdx]?.size ?? 0) === SLOTS.length
      return { ...prev, [weekOffset]: { ...week, [dayIdx]: allSelected ? new Set<string>() : new Set(SLOTS) } }
    })
    setSaved(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset, basePattern])

  function resetToBase() {
    setWeekOverrides(prev => {
      const next = { ...prev }
      delete next[weekOffset]
      return next
    })
    setSaved(false)
  }

  async function handleSave() {
    const weeklyPattern: Record<string, string[]> = {}
    const pat = getOrInitWeek()
    for (const [day, slots] of Object.entries(pat)) {
      weeklyPattern[day] = Array.from(slots).sort()
    }
    await saveMutation.mutateAsync({ weeklyPattern, exceptions })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function addException() {
    if (!exStartDate) return
    const end = exEndDate || exStartDate
    setExceptions(prev => [...prev, { startDate: exStartDate, endDate: end, label: exLabel || undefined }])
    setExStartDate(''); setExEndDate(''); setExLabel('')
    setShowExModal(false)
    setSaved(false)
  }

  function removeException(idx: number) {
    setExceptions(prev => prev.filter((_, i) => i !== idx))
    setSaved(false)
  }

  const hasOverride = Boolean(weekOverrides[weekOffset])

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <ClassroomBG seed={2} />
      <div className="relative flex flex-col min-h-screen">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2 relative z-10">
          <button onClick={() => navigate(R.TEACHER_DASHBOARD)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.65)', border: '1px solid rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', cursor: 'pointer' }}>
            <Icon name="back" size={18} color={BB.ink} />
          </button>
          <div style={{ flex: 1, fontSize: 20, fontWeight: 800, color: BB.ink, letterSpacing: -0.3 }}>Availability</div>
          {saved ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: BB.green, fontWeight: 700, fontSize: 13 }}>
              <Icon name="check" size={16} color={BB.green} /> Saved!
            </div>
          ) : (
            <GradPill size="sm" variant="teal" onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving…' : 'Save Week'}
            </GradPill>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-28 relative z-10">

          {/* Info note */}
          <div style={{ fontSize: 12, color: BB.inkSoft, padding: '10px 14px', borderRadius: 12, background: `${BB.teal}12`, border: `1px solid ${BB.teal}25`, marginBottom: 14, marginTop: 4 }}>
            <span style={{ fontWeight: 700, color: BB.teal }}>Note: </span>
            Set your availability week-by-week. Weeks without changes inherit your default pattern. Changes take effect for future bookings.
          </div>

          {/* ── Week Navigation ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => setWeekOffset(o => Math.max(MIN_OFFSET, o - 1))}
              disabled={weekOffset <= MIN_OFFSET}
              style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.65)', border: '1px solid rgba(255,255,255,.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: weekOffset <= MIN_OFFSET ? 'not-allowed' : 'pointer', opacity: weekOffset <= MIN_OFFSET ? 0.4 : 1, flexShrink: 0 }}>
              <Icon name="chev-l" size={16} color={BB.ink} />
            </button>

            <div style={{ flex: 1, textAlign: 'center', padding: '7px 10px', borderRadius: 12, background: 'rgba(255,255,255,.55)', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: BB.teal, marginBottom: 1 }}>
                {weekOffset === 0 ? 'Current Week' : weekOffset === 1 ? 'Next Week' : weekOffset === -1 ? 'Last Week' : weekOffset > 0 ? `${weekOffset} weeks ahead` : `${Math.abs(weekOffset)} weeks ago`}
                {hasOverride && (
                  <span style={{ marginLeft: 6, fontSize: 10, background: BB.teal, color: '#fff', borderRadius: 99, padding: '1px 6px' }}>edited</span>
                )}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: BB.ink }}>
                {fmtWeekRange(weekOffset)}
              </div>
            </div>

            <button
              onClick={() => setWeekOffset(o => Math.min(MAX_OFFSET, o + 1))}
              disabled={weekOffset >= MAX_OFFSET}
              style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.65)', border: '1px solid rgba(255,255,255,.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: weekOffset >= MAX_OFFSET ? 'not-allowed' : 'pointer', opacity: weekOffset >= MAX_OFFSET ? 0.4 : 1, flexShrink: 0 }}>
              <Icon name="chev-r" size={16} color={BB.ink} />
            </button>
          </div>

          {/* Reset button (only shown when overridden) */}
          {hasOverride && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button onClick={resetToBase}
                style={{ fontSize: 12, fontWeight: 700, color: BB.coral, background: `${BB.coral}12`, border: `1px solid ${BB.coral}30`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}>
                Reset to default
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-2 border-[#4AADBC] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Glass padding={14} style={{ marginBottom: 14 }}>
              <div style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: 340 }}>

                  {/* Column headers: dates */}
                  <div style={{ display: 'grid', gridTemplateColumns: '44px repeat(7, 1fr)', gap: 3, marginBottom: 2 }}>
                    <div />
                    {currentWeekDates.map((d, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: BB.inkMute }}>{DAYS[i]}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: BB.inkSoft }}>{d.getDate()}/{d.getMonth() + 1}</div>
                      </div>
                    ))}
                  </div>

                  {/* All Day checkboxes */}
                  <div style={{ display: 'grid', gridTemplateColumns: '44px repeat(7, 1fr)', gap: 3, marginBottom: 4, alignItems: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: BB.inkMute, textAlign: 'right', paddingRight: 6, lineHeight: '1.2' }}>All<br/>Day</div>
                    {DAYS.map((_, dayIdx) => {
                      const allSelected  = (activePattern[dayIdx]?.size ?? 0) === SLOTS.length
                      const someSelected = (activePattern[dayIdx]?.size ?? 0) > 0 && !allSelected
                      return (
                        <div key={dayIdx} onClick={() => toggleAllDay(dayIdx)}
                          style={{ height: 22, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: allSelected ? BB.teal : someSelected ? `${BB.teal}40` : 'rgba(0,0,0,.06)', border: allSelected ? `1px solid ${BB.teal}88` : someSelected ? `1px solid ${BB.teal}55` : '1px solid transparent', cursor: 'pointer', transition: 'background .12s' }}>
                          {allSelected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          {someSelected && <div style={{ width: 6, height: 2, borderRadius: 1, background: BB.teal }} />}
                        </div>
                      )
                    })}
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: 'rgba(0,0,0,.06)', marginBottom: 4 }} />

                  {/* Time rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {SLOTS.map(slot => {
                      const isHour = slot.endsWith(':00')
                      return (
                        <div key={slot} style={{ display: 'grid', gridTemplateColumns: '44px repeat(7, 1fr)', gap: 3, alignItems: 'center' }}>
                          <div style={{ fontSize: isHour ? 10 : 9, fontWeight: isHour ? 700 : 400, color: isHour ? BB.inkSoft : BB.inkMute, textAlign: 'right', paddingRight: 6 }}>
                            {isHour ? slot : ''}
                          </div>
                          {DAYS.map((_, dayIdx) => {
                            const active = activePattern[dayIdx]?.has(slot) ?? false
                            return (
                              <div key={dayIdx} onClick={() => toggleSlot(dayIdx, slot)}
                                style={{ height: 22, borderRadius: 5, background: active ? BB.teal : 'rgba(0,0,0,.06)', cursor: 'pointer', transition: 'background .12s', border: active ? `1px solid ${BB.teal}88` : '1px solid transparent' }} />
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,.06)' }}>
                {[
                  { bg: BB.teal, label: 'Available' },
                  { bg: `${BB.teal}40`, border: `1px solid ${BB.teal}55`, label: 'Partial' },
                  { bg: 'rgba(0,0,0,.06)', label: 'Unavailable' },
                ].map(({ bg, border, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: bg, border: border ?? undefined }} />
                    <span style={{ fontSize: 11, color: BB.inkSoft, fontWeight: 600 }}>{label}</span>
                  </div>
                ))}
              </div>
            </Glass>
          )}

          {/* Exceptions */}
          <div style={{ fontSize: 13, fontWeight: 800, color: BB.inkSoft, letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>
            Date Exceptions
          </div>

          {exceptions.length === 0 ? (
            <div style={{ fontSize: 13, color: BB.inkMute, marginBottom: 12 }}>No exceptions set.</div>
          ) : (
            <div className="flex flex-col gap-2 mb-3">
              {exceptions.map((ex, idx) => (
                <Glass key={idx} padding={12} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: BB.ink }}>{fmtExDate(ex)}</div>
                    {ex.label && <div style={{ fontSize: 12, color: BB.inkSoft }}>{ex.label}</div>}
                  </div>
                  <button onClick={() => removeException(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: BB.coral, padding: 4, fontSize: 14, fontWeight: 700 }}>
                    ✕
                  </button>
                </Glass>
              ))}
            </div>
          )}

          <GradPill variant="glass" size="sm" onClick={() => setShowExModal(true)}>
            <Icon name="plus" size={14} /> Add Exception
          </GradPill>
        </div>

        <BottomNav tabs={TEACHER_TABS} accent={BB.teal} />
      </div>

      {/* ── Add Exception Modal ── */}
      {showExModal && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowExModal(false)}>
          <div className="w-full rounded-t-3xl" style={{ background: '#FAF9F6', padding: '20px 20px 48px' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 999, background: 'rgba(0,0,0,.12)', margin: '0 auto 20px' }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: BB.ink, marginBottom: 16 }}>Add Exception</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: BB.inkSoft, display: 'block', marginBottom: 6 }}>Start Date</label>
                <input type="date" value={exStartDate}
                  onChange={e => { setExStartDate(e.target.value); if (exEndDate && e.target.value > exEndDate) setExEndDate(e.target.value) }}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,.1)', background: 'rgba(255,255,255,.8)', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: BB.inkSoft, display: 'block', marginBottom: 6 }}>
                  End Date <span style={{ fontWeight: 400, color: BB.inkMute }}>(leave blank for single day)</span>
                </label>
                <input type="date" value={exEndDate} min={exStartDate || undefined}
                  onChange={e => setExEndDate(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,.1)', background: 'rgba(255,255,255,.8)', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: BB.inkSoft, display: 'block', marginBottom: 6 }}>Reason (optional)</label>
                <input type="text" value={exLabel} onChange={e => setExLabel(e.target.value)}
                  placeholder="e.g. Public holiday"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,.1)', background: 'rgba(255,255,255,.8)', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <GradPill variant="teal" size="md" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={addException}>
                Mark Unavailable
              </GradPill>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
