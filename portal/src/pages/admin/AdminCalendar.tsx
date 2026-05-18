import { useState, useMemo, useEffect } from 'react'
import { format, addDays, parseISO, startOfWeek, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, X, AlertCircle, Check } from 'lucide-react'
import {
  useAdminCalendar, useAdminTeachers, useAdminStudents,
  useAdminProgrammes, useCreateClass, useUpdateClass, useRescheduleClass,
} from '../../hooks/admin'
import type { CalendarSession } from '../../hooks/admin'

// ─── Constants ────────────────────────────────────────────────────────────────

const CAL_START  = 10   // 10am
const CAL_END    = 20   // 8pm
const PX_PER_MIN = 1.2  // pixels per minute → 60min = 72px

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function mondayOf(date: Date) {
  return startOfWeek(date, { weekStartsOn: 1 })
}
function currentMondayStr() {
  return format(mondayOf(new Date()), 'yyyy-MM-dd')
}

// ─── Teacher colour lookup ─────────────────────────────────────────────────────

const TEACHER_COLORS: Record<string, string> = {
  Beverly: '#F5C842', Tristan: '#E8623A', May: '#4AADBC',
  Cato: '#9B5DE5', Gwen: '#06D6A0', Donna: '#F0A94A',
}

function tColor(name: string, fallback: string) {
  for (const [k, v] of Object.entries(TEACHER_COLORS)) {
    if (name.includes(k)) return v
  }
  return fallback
}

// ─── Session Detail Modal ─────────────────────────────────────────────────────

function SessionModal({
  session, onClose, onReschedule,
}: {
  session: CalendarSession
  onClose: () => void
  onReschedule: (s: CalendarSession) => void
}) {
  const updateMutation = useUpdateClass()
  const color = tColor(session.teacher.name, session.teacher.color)

  async function setStatus(status: string) {
    await updateMutation.mutateAsync({ id: session.id, status })
    onClose()
  }

  const statusColors: Record<string, string> = {
    SCHEDULED: '#4AADBC', COMPLETED: '#16A34A', CANCELLED: '#DC2626', RESCHEDULED: '#9CA3AF',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400, boxShadow: '0 24px 80px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 44, borderRadius: 2, background: color }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A2E' }}>{session.student.name}</div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>{session.programme.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, border: 'none', background: '#F5F3EF', cursor: 'pointer' }}><X size={16} color="#6B7280" /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, padding: '14px 16px', background: '#F8F7F4', borderRadius: 12 }}>
          {[
            { k: 'Teacher',  v: session.teacher.name },
            { k: 'When',     v: `${session.displayDate} · ${session.displayTime}` },
            { k: 'Duration', v: `${session.durationMin} min` },
            { k: 'Status',   v: <span style={{ fontWeight: 700, color: statusColors[session.status] ?? '#6B7280' }}>{session.status}</span> },
            ...(session.isMakeup ? [{ k: 'Type', v: <span style={{ color: '#F0A94A', fontWeight: 700 }}>Makeup class</span> }] : []),
            ...(session.notes ? [{ k: 'Notes', v: session.notes }] : []),
          ].map(({ k, v }) => (
            <div key={k} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ width: 64, fontSize: 11, fontWeight: 700, color: '#9CA3AF', paddingTop: 2 }}>{k}</span>
              <span style={{ fontSize: 13, color: '#1A1A2E', flex: 1 }}>{v}</span>
            </div>
          ))}
        </div>

        {session.status === 'SCHEDULED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => setStatus('COMPLETED')} disabled={updateMutation.isPending}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 0', borderRadius: 10, border: 'none', background: '#4AADBC', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              <Check size={15} />Mark Completed
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onReschedule(session)}
                style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: '1px solid #E8E6E1', background: '#fff', color: '#1A1A2E', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Reschedule
              </button>
              <button onClick={() => setStatus('CANCELLED')} disabled={updateMutation.isPending}
                style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Reschedule Modal ─────────────────────────────────────────────────────────

function RescheduleModal({ session, onClose }: { session: CalendarSession; onClose: () => void }) {
  const [date, setDate] = useState(session.dateStr)
  const [time, setTime] = useState(session.displayTime.replace(' ', '').toLowerCase().replace('am', '').replace('pm', ''))
  const rescheduleMutation = useRescheduleClass()
  const [error, setError] = useState('')

  // Build available time slots
  const slots = []
  for (let h = 9; h < 20; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    slots.push(`${String(h).padStart(2, '0')}:30`)
  }

  async function handleSubmit() {
    setError('')
    try {
      await rescheduleMutation.mutateAsync({ id: session.id, date, startTime: time })
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to reschedule'
      setError(msg)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 380, boxShadow: '0 24px 80px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#1A1A2E', marginBottom: 6 }}>Reschedule Class</div>
        <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
          {session.student.name} · {session.programme.name}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 6 }}>New Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={format(new Date(), 'yyyy-MM-dd')} style={inputSt} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 6 }}>New Start Time</label>
            <select value={time} onChange={e => setTime(e.target.value)} style={inputSt}>
              {slots.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#FEF2F2', color: '#DC2626', fontSize: 12 }}>
            <AlertCircle size={14} />{error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid #E8E6E1', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={rescheduleMutation.isPending} style={{ flex: 2, padding: '10px 0', borderRadius: 10, border: 'none', background: '#4AADBC', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
            {rescheduleMutation.isPending ? 'Saving…' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Create Class Modal (2-step: define class → enrol students) ───────────────

type RecurringOption = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'
type ClassType = 'individual' | 'group'

interface ClassFormData {
  programmeId: string
  teacherId: string
  date: string
  startTime: string
  durationMin: number
  recurring: RecurringOption
  classType: ClassType
  notes: string
}

const RECURRING_OPTIONS: { value: RecurringOption; label: string }[] = [
  { value: 'none',     label: 'No repeat'  },
  { value: 'daily',    label: 'Daily'      },
  { value: 'weekly',   label: 'Weekly'     },
  { value: 'biweekly', label: 'Bi-weekly'  },
  { value: 'monthly',  label: 'Monthly'    },
]

function Toggle({ on, onToggle, labelOn, labelOff }: { on: boolean; onToggle: () => void; labelOn: string; labelOff: string }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid #E8E6E1' }}>
      {[false, true].map(val => (
        <button key={String(val)} type="button" onClick={() => { if (on !== val) onToggle() }}
          style={{ flex: 1, padding: '8px 0', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
            background: on === val ? '#1A1A2E' : '#fff',
            color: on === val ? '#fff' : '#9CA3AF',
          }}>
          {val ? labelOn : labelOff}
        </button>
      ))}
    </div>
  )
}

function CreateClassModal({ onClose }: { onClose: () => void }) {
  const { data: programmes = [] } = useAdminProgrammes()
  const { data: teachers = [] }   = useAdminTeachers()
  const { data: students = [] }   = useAdminStudents({ status: 'active' })
  const createMutation            = useCreateClass()

  const [step, setStep] = useState<'define' | 'enrol'>('define')
  const [error, setError] = useState('')

  const [form, setForm] = useState<ClassFormData>({
    programmeId: '', teacherId: '',
    date: format(new Date(), 'yyyy-MM-dd'), startTime: '14:00',
    durationMin: 60, recurring: 'none', classType: 'individual', notes: '',
  })

  // Enrol step state
  const [stuSearch,  setStuSearch]  = useState('')
  const [enrolled,   setEnrolled]   = useState<string[]>([])
  const [showDrop,   setShowDrop]   = useState(false)

  const selectedProg   = programmes.find(p => p.id === form.programmeId)
  const defaultDur     = selectedProg?.defaultDurationMin ?? 60
  const slots: string[] = []
  for (let h = 9; h < 20; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    slots.push(`${String(h).padStart(2, '0')}:30`)
  }

  const filteredStudents = students.filter(s =>
    !enrolled.includes(s.id) && s.name.toLowerCase().includes(stuSearch.toLowerCase())
  )

  async function handleCreateClass() {
    setError('')
    if (!form.programmeId || !form.teacherId || !form.date) {
      setError('Programme, teacher and date are required')
      return
    }
    try {
      await createMutation.mutateAsync(form)
      setStep('enrol')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to create class'
      setError(msg)
    }
  }

  function addStudent(id: string, name: string) {
    setEnrolled(prev => [...prev, id])
    setStuSearch('')
    setShowDrop(false)
    // In a real app this would call an enrol API
    void name
  }

  function removeStudent(id: string) {
    setEnrolled(prev => prev.filter(x => x !== id))
  }

  const enrolledStudents = students.filter(s => enrolled.includes(s.id))

  // ── Step 1: define the class ────────────────────────────────────────────────
  if (step === 'define') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
        <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>

          <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #F0EDE8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#1A1A2E' }}>New Class</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Step 1 of 2 — Define the class</div>
            </div>
            <button onClick={onClose} style={{ padding: 6, borderRadius: 8, border: 'none', background: '#F5F3EF', cursor: 'pointer' }}><X size={16} color="#6B7280" /></button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Programme */}
            <div>
              <FieldLabel>Programme *</FieldLabel>
              <select value={form.programmeId} onChange={e => {
                const p = programmes.find(pr => pr.id === e.target.value)
                setForm(f => ({ ...f, programmeId: e.target.value, durationMin: p?.defaultDurationMin ?? f.durationMin }))
              }} style={inputSt}>
                <option value="">Select programme…</option>
                <optgroup label="Literacy">
                  {programmes.filter(p => p.category === 'LITERACY').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </optgroup>
                <optgroup label="Maths">
                  {programmes.filter(p => p.category === 'MATHS').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </optgroup>
              </select>
            </div>

            {/* Teacher */}
            <div>
              <FieldLabel>Teacher *</FieldLabel>
              <select value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))} style={inputSt}>
                <option value="">Select teacher…</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            {/* Date + Start Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <FieldLabel>Date *</FieldLabel>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputSt} />
              </div>
              <div>
                <FieldLabel>Start Time</FieldLabel>
                <select value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} style={inputSt}>
                  {slots.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Class Length */}
            <div>
              <FieldLabel>Class Length</FieldLabel>
              <div style={{ display: 'flex', gap: 8 }}>
                {[30, 45, 60, 90].map(d => (
                  <button key={d} type="button" onClick={() => setForm(f => ({ ...f, durationMin: d }))}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: `2px solid ${form.durationMin === d ? '#4AADBC' : '#E8E6E1'}`, background: form.durationMin === d ? '#EFF9FB' : '#fff', fontSize: 12, fontWeight: 700, color: form.durationMin === d ? '#4AADBC' : '#6B7280', cursor: 'pointer' }}>
                    {d}m
                  </button>
                ))}
              </div>
              {selectedProg && defaultDur !== form.durationMin && (
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Default for this programme: {defaultDur} min</div>
              )}
            </div>

            {/* Recurring */}
            <div>
              <FieldLabel>Recurring</FieldLabel>
              <select value={form.recurring} onChange={e => setForm(f => ({ ...f, recurring: e.target.value as RecurringOption }))} style={inputSt}>
                {RECURRING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Individual / Group */}
            <div>
              <FieldLabel>Class Type</FieldLabel>
              <Toggle
                on={form.classType === 'group'}
                onToggle={() => setForm(f => ({ ...f, classType: f.classType === 'individual' ? 'group' : 'individual' }))}
                labelOff="Individual"
                labelOn="Group"
              />
            </div>

            {/* Notes */}
            <div>
              <FieldLabel>Notes (optional)</FieldLabel>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} style={{ ...inputSt, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 10, background: '#FEF2F2', color: '#DC2626', fontSize: 13 }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{error}
              </div>
            )}
          </div>

          <div style={{ padding: '14px 24px', borderTop: '1px solid #F0EDE8', display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid #E8E6E1', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleCreateClass} disabled={createMutation.isPending}
              style={{ flex: 2, padding: '10px 0', borderRadius: 10, border: 'none', background: '#4AADBC', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              {createMutation.isPending ? 'Creating…' : 'Create Class →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 2: enrol students ──────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>

        <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #F0EDE8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={14} color="#059669" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#1A1A2E' }}>Class Created</div>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', paddingLeft: 38 }}>
            {programmes.find(p => p.id === form.programmeId)?.name ?? 'Class'} · {teachers.find(t => t.id === form.teacherId)?.name} · {form.date} {form.startTime}
            {form.recurring !== 'none' && ` · ${RECURRING_OPTIONS.find(o => o.value === form.recurring)?.label}`}
            {' · '}{form.classType === 'group' ? 'Group' : 'Individual'}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>Enrol Students</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Add students now, or skip — parents can also self-enrol.</div>
          </div>

          {/* Student search */}
          <div style={{ position: 'relative' }}>
            <input
              value={stuSearch}
              onChange={e => { setStuSearch(e.target.value); setShowDrop(true) }}
              onFocus={() => setShowDrop(true)}
              placeholder="Search student to add…"
              style={inputSt}
            />
            {showDrop && filteredStudents.length > 0 && (
              <div style={{ position: 'absolute', zIndex: 20, top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #E8E6E1', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.1)', maxHeight: 180, overflowY: 'auto', marginTop: 4 }}>
                {filteredStudents.slice(0, 10).map(s => (
                  <button key={s.id} type="button" onClick={() => addStudent(s.id, s.name)}
                    style={{ width: '100%', textAlign: 'left', padding: '9px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{s.name}</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{s.enrollments[0]?.programme.name ?? ''}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Enrolled list */}
          {enrolledStudents.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {enrolledStudents.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 10, background: '#F8F7F4', border: '1px solid #EDE9E3' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{s.enrollments[0]?.programme.name ?? ''}</div>
                  </div>
                  <button onClick={() => removeStudent(s.id)} style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {enrolledStudents.length === 0 && (
            <div style={{ padding: '16px', borderRadius: 10, background: '#F8F7F4', border: '1px dashed #E8E6E1', textAlign: 'center', color: '#C4C0BB', fontSize: 12 }}>
              No students enrolled yet
            </div>
          )}
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid #F0EDE8', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid #E8E6E1', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Skip for now</button>
          <button onClick={onClose} disabled={enrolled.length === 0}
            style={{ flex: 2, padding: '10px 0', borderRadius: 10, border: 'none', background: enrolled.length > 0 ? '#4AADBC' : '#E5E7EB', color: enrolled.length > 0 ? '#fff' : '#9CA3AF', fontSize: 13, fontWeight: 800, cursor: enrolled.length > 0 ? 'pointer' : 'default' }}>
            Enrol {enrolled.length > 0 ? `${enrolled.length} student${enrolled.length > 1 ? 's' : ''}` : 'Students'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 6 }}>{children}</label>
}

const inputSt: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 10,
  border: '1px solid #E8E6E1', background: '#fff',
  fontSize: 13, color: '#1A1A2E', boxSizing: 'border-box',
  outline: 'none', fontFamily: 'inherit',
}

// ─── Overlap layout ────────────────────────────────────────────────────────────

interface LayoutSession {
  session: CalendarSession
  col: number
  numCols: number
}

function layoutSessions(sessions: CalendarSession[]): LayoutSession[] {
  const sorted = [...sessions].sort((a, b) =>
    (a.hktHour * 60 + a.hktMin) - (b.hktHour * 60 + b.hktMin)
  )

  const placed: Array<{ session: CalendarSession; col: number; startMin: number; endMin: number }> = []

  for (const s of sorted) {
    const startMin = s.hktHour * 60 + s.hktMin
    const endMin   = startMin + s.durationMin

    const overlapping = placed.filter(p => p.startMin < endMin && p.endMin > startMin)
    const usedCols    = new Set(overlapping.map(p => p.col))
    let col = 0
    while (usedCols.has(col)) col++

    placed.push({ session: s, col, startMin, endMin })
  }

  // Compute numCols = max col within each overlap cluster + 1
  return placed.map(p => {
    const overlapping = placed.filter(q => q.startMin < p.endMin && q.endMin > p.startMin)
    const numCols = Math.max(...overlapping.map(q => q.col)) + 1
    return { session: p.session, col: p.col, numCols }
  })
}

// ─── Calendar Grid ────────────────────────────────────────────────────────────

function CalendarGrid({
  weekDays, sessions, visibleTeachers, onSelectSession,
}: {
  weekDays: { dateStr: string; date: Date; label: string; num: string }[]
  sessions: CalendarSession[]
  visibleTeachers: Set<string>
  onSelectSession: (s: CalendarSession) => void
}) {
  const totalMinutes = (CAL_END - CAL_START) * 60
  const totalHeight  = totalMinutes * PX_PER_MIN
  const hours = Array.from({ length: CAL_END - CAL_START + 1 }, (_, i) => CAL_START + i)

  const sessionsByDay = useMemo(() => {
    const map: Record<string, CalendarSession[]> = {}
    for (const s of sessions) {
      if (!map[s.dateStr]) map[s.dateStr] = []
      map[s.dateStr].push(s)
    }
    return map
  }, [sessions])

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Time gutter */}
      <div style={{ width: 52, flexShrink: 0, paddingTop: 40, position: 'relative' }}>
        <div style={{ position: 'relative', height: totalHeight }}>
          {hours.map(h => (
            <div key={h} style={{ position: 'absolute', top: (h - CAL_START) * 60 * PX_PER_MIN, right: 8, fontSize: 10, fontWeight: 600, color: '#C4C0BB', lineHeight: 1 }}>
              {h === 12 ? '12pm' : h < 12 ? `${h}am` : `${h - 12}pm`}
            </div>
          ))}
        </div>
      </div>

      {/* Day columns */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${weekDays.length}, 1fr)`, overflow: 'auto' }}>
        {weekDays.map(day => {
          const daySessions = (sessionsByDay[day.dateStr] ?? []).filter(
            s => visibleTeachers.size === 0 || visibleTeachers.has(s.teacher.name)
          )
          const laid  = layoutSessions(daySessions)
          const today = isToday(day.date)

          return (
            <div key={day.dateStr} style={{ borderLeft: '1px solid #F0EDE8', display: 'flex', flexDirection: 'column' }}>
              {/* Day header */}
              <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderBottom: '1px solid #F0EDE8', background: today ? '#EFF9FB' : '#fff', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: today ? '#4AADBC' : '#9CA3AF' }}>{day.label}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: today ? '#4AADBC' : '#1A1A2E', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: today ? '#4AADBC22' : 'transparent' }}>
                  {day.num}
                </span>
              </div>

              {/* Time slots + sessions */}
              <div style={{ position: 'relative', height: totalHeight, flexShrink: 0 }}>
                {/* Hour lines */}
                {hours.map(h => (
                  <div key={h} style={{ position: 'absolute', top: (h - CAL_START) * 60 * PX_PER_MIN, left: 0, right: 0, height: 1, background: h === CAL_START ? 'transparent' : '#F5F3EF' }} />
                ))}

                {/* Sessions — column-aware overlap layout */}
                {laid.map(({ session: s, col, numCols }) => {
                  const minutesFromTop = (s.hktHour - CAL_START) * 60 + s.hktMin
                  if (minutesFromTop < 0 || minutesFromTop >= totalMinutes) return null
                  const top    = minutesFromTop * PX_PER_MIN
                  const height = Math.max(s.durationMin * PX_PER_MIN - 2, 20)
                  const color  = tColor(s.teacher.name, s.teacher.color)
                  const pct    = 100 / numCols

                  return (
                    <button
                      key={s.id}
                      onClick={() => onSelectSession(s)}
                      style={{
                        position: 'absolute',
                        top: top + 1,
                        left:  `calc(${col * pct}% + 3px)`,
                        width: `calc(${pct}% - 6px)`,
                        height, borderRadius: 7,
                        background: `${color}20`, borderLeft: `3px solid ${color}`,
                        border: `1px solid ${color}44`, borderLeftWidth: 3,
                        padding: '3px 6px', textAlign: 'left',
                        cursor: 'pointer', overflow: 'hidden',
                        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
                        transition: 'filter .1s',
                        boxSizing: 'border-box',
                      }}
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
                      onMouseLeave={e => e.currentTarget.style.filter = ''}
                    >
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#1A1A2E', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.programme.name}
                      </div>
                      {height > 30 && (
                        <div style={{ fontSize: 10, color: '#6B7280', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.student.name.split(' ')[0]}
                        </div>
                      )}
                      {height > 46 && (
                        <div style={{ fontSize: 10, color, fontWeight: 700 }}>
                          {s.durationMin}m
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Calendar ────────────────────────────────────────────────────────────

export default function AdminCalendar() {
  const [weekStart, setWeekStart]         = useState(currentMondayStr)
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null)
  const [rescheduleSession, setRescheduleSession] = useState<CalendarSession | null>(null)
  useEffect(() => { document.title = 'Calendar — Our Learning Portal' }, [])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [visibleTeachers, setVisibleTeachers] = useState<Set<string>>(new Set())

  const { data: calData, isLoading } = useAdminCalendar(weekStart)
  const { data: teachers = [] }      = useAdminTeachers()
  const sessions = calData?.sessions ?? []

  const weekDays = useMemo(() => {
    const monday = parseISO(weekStart)
    return DAYS.map((label, i) => {
      const date = addDays(monday, i)
      return { dateStr: format(date, 'yyyy-MM-dd'), date, label, num: format(date, 'd') }
    })
  }, [weekStart])

  const weekLabel = `${weekDays[0].num} ${format(parseISO(weekStart), 'MMM')} – ${weekDays[5].num} ${format(addDays(parseISO(weekStart), 5), 'MMM yyyy')}`
  const isCurrentWeek = weekStart === currentMondayStr()

  function navigateWeek(dir: 1 | -1) {
    const newMonday = addDays(parseISO(weekStart), dir * 7)
    setWeekStart(format(newMonday, 'yyyy-MM-dd'))
  }

  function toggleTeacher(name: string) {
    setVisibleTeachers(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '16px 24px 12px', background: '#fff', borderBottom: '1px solid #F0EDE8', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#1A1A2E', margin: 0 }}>Calendar</h1>

            {/* Week nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => navigateWeek(-1)} style={{ padding: 5, borderRadius: 8, border: '1px solid #E8E6E1', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={16} color="#4B5563" />
              </button>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E', minWidth: 200, textAlign: 'center' }}>{weekLabel}</span>
              <button onClick={() => navigateWeek(1)} style={{ padding: 5, borderRadius: 8, border: '1px solid #E8E6E1', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <ChevronRight size={16} color="#4B5563" />
              </button>
              {!isCurrentWeek && (
                <button onClick={() => setWeekStart(currentMondayStr())} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #4AADBC', background: '#EFF9FB', color: '#4AADBC', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Today
                </button>
              )}
            </div>
          </div>

          <button onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none', background: '#4AADBC', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            <Plus size={16} />New Class
          </button>
        </div>

        {/* Teacher filter chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setVisibleTeachers(new Set())}
            style={{ padding: '4px 12px', borderRadius: 999, border: `1.5px solid ${visibleTeachers.size === 0 ? '#4AADBC' : '#E8E6E1'}`, background: visibleTeachers.size === 0 ? '#EFF9FB' : '#fff', fontSize: 12, fontWeight: 700, color: visibleTeachers.size === 0 ? '#4AADBC' : '#6B7280', cursor: 'pointer' }}>
            All Teachers
          </button>
          {teachers.map(t => {
            const active = visibleTeachers.has(t.name)
            const color  = tColor(t.name, t.color)
            return (
              <button key={t.id} onClick={() => toggleTeacher(t.name)}
                style={{ padding: '4px 12px', borderRadius: 999, border: `1.5px solid ${active ? color : '#E8E6E1'}`, background: active ? `${color}22` : '#fff', fontSize: 12, fontWeight: 700, color: active ? '#1A1A2E' : '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? color : '#D1D5DB', display: 'inline-block' }} />
                {t.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Calendar body */}
      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB' }}>Loading…</div>
      ) : (
        <CalendarGrid
          weekDays={weekDays}
          sessions={sessions}
          visibleTeachers={visibleTeachers}
          onSelectSession={setSelectedSession}
        />
      )}

      {/* Modals */}
      {selectedSession && !rescheduleSession && (
        <SessionModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onReschedule={(s) => { setRescheduleSession(s); setSelectedSession(null) }}
        />
      )}
      {rescheduleSession && (
        <RescheduleModal session={rescheduleSession} onClose={() => setRescheduleSession(null)} />
      )}
      {showCreateModal && (
        <CreateClassModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}
