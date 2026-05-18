import { useState, useEffect } from 'react'
import {
  Users, Clock, DollarSign, ChevronRight, X, Check,
  Plus, FileText,
} from 'lucide-react'
import {
  useAdminTeachers, useAdminTeacherDetail,
  useCreateTeacher,
  useGeneratePayslip, useConfirmPayslip,
  type AdminTeacher, type AdminPayslip,
} from '../../hooks/admin'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) { return `HKD ${Math.round(n).toLocaleString()}` }

const PAYSLIP_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: 'Draft',     color: '#6B7280', bg: '#F3F4F6' },
  CONFIRMED: { label: 'Confirmed', color: '#059669', bg: '#ECFDF5' },
  PAID:      { label: 'Paid',      color: '#2563EB', bg: '#EFF6FF' },
}

function PayslipBadge({ status }: { status: string }) {
  const m = PAYSLIP_STATUS[status] ?? PAYSLIP_STATUS.DRAFT
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
      borderRadius: 99, background: m.bg, color: m.color, fontSize: 11, fontWeight: 600,
    }}>
      {m.label}
    </span>
  )
}

// ─── Weekly Availability Grid (read-only) ─────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 12 }, (_, i) => i + 10) // 10am – 9pm

function AvailabilityGrid({ pattern }: { pattern: Record<string, unknown> | null | undefined }) {
  if (!pattern) return <div style={{ color: '#9CA3AF', fontSize: 13 }}>No availability set</div>
  const pat = pattern  // narrowed copy for nested function

  function isAvailable(dayIdx: number, hour: number): boolean {
    const dayData = pat[String(dayIdx)] as { slots?: number[] } | undefined
    return dayData?.slots?.includes(hour) ?? false
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `40px repeat(${DAYS.length}, 1fr)`, gap: 3, minWidth: 340 }}>
        {/* Header row */}
        <div />
        {DAYS.map(d => (
          <div key={d} style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textAlign: 'center', paddingBottom: 4 }}>
            {d}
          </div>
        ))}
        {/* Time rows */}
        {HOURS.map(h => (
          <>
            <div key={`h-${h}`} style={{ fontSize: 10, color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6 }}>
              {h > 12 ? `${h - 12}pm` : h === 12 ? '12pm' : `${h}am`}
            </div>
            {DAYS.map((_, di) => (
              <div key={`${h}-${di}`} style={{
                height: 16, borderRadius: 3,
                background: isAvailable(di, h) ? '#4AADBC' : '#F3F4F6',
              }} />
            ))}
          </>
        ))}
      </div>
    </div>
  )
}

// ─── Payslip Modal ────────────────────────────────────────────────────────────

function PayslipModal({ teacherId, teacherName, onClose }: {
  teacherId: string
  teacherName: string
  onClose: () => void
}) {
  const generate = useGeneratePayslip()
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay  = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const fmtDate  = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const [periodStart, setPeriodStart] = useState(fmtDate(firstDay))
  const [periodEnd, setPeriodEnd]     = useState(fmtDate(lastDay))
  const [error, setError]             = useState('')

  async function handleGenerate() {
    try {
      await generate.mutateAsync({ teacherId, periodStart, periodEnd })
      onClose()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } }
      setError(err?.response?.data?.error ?? 'Failed')
    }
  }

  return (
    <div style={modalOverlay}>
      <div style={{ ...modalBox, width: 420 }}>
        <div style={modalHeader}>
          <span style={{ fontWeight: 700 }}>Generate Payslip — {teacherName}</span>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={fieldLabel}>
              Period Start
              <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} style={inputStyle} />
            </label>
            <label style={fieldLabel}>
              Period End
              <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} min={periodStart} style={inputStyle} />
            </label>
          </div>
          {error && <div style={{ color: '#DC2626', fontSize: 13 }}>{error}</div>}
        </div>
        <div style={{ padding: '12px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={handleGenerate} disabled={generate.isPending} style={primaryBtn}>
            {generate.isPending ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Create Teacher Modal ─────────────────────────────────────────────────────

const COLORS = ['#F5C842', '#E8623A', '#4AADBC', '#9B5DE5', '#06D6A0', '#F0A94A', '#60A5FA', '#F472B6']

function CreateTeacherModal({ onClose }: { onClose: () => void }) {
  const create = useCreateTeacher()
  const [form, setForm] = useState({
    salutation: 'Ms', firstName: '', lastName: '', email: '',
    password: '', speciality: '', ratePerHour: '', color: COLORS[2],
  })
  const [error, setError] = useState('')

  function set(field: string, val: string) { setForm(f => ({ ...f, [field]: val })) }

  async function handleSubmit() {
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.speciality || !form.ratePerHour) {
      setError('All fields are required'); return
    }
    try {
      await create.mutateAsync({
        ...form, ratePerHour: parseFloat(form.ratePerHour),
      })
      onClose()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } }
      setError(err?.response?.data?.error ?? 'Failed to create teacher')
    }
  }

  return (
    <div style={modalOverlay}>
      <div style={{ ...modalBox, width: 520 }}>
        <div style={modalHeader}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Add Teacher</span>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 10 }}>
            <label style={fieldLabel}>
              Title
              <select value={form.salutation} onChange={e => set('salutation', e.target.value)} style={inputStyle}>
                <option>Ms</option><option>Mr</option><option>Mrs</option><option>Dr</option>
              </select>
            </label>
            <label style={fieldLabel}>
              First Name
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)} style={inputStyle} />
            </label>
            <label style={fieldLabel}>
              Last Name
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)} style={inputStyle} />
            </label>
          </div>
          <label style={fieldLabel}>
            Email
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} />
          </label>
          <label style={fieldLabel}>
            Password (min 8 chars)
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} style={inputStyle} />
          </label>
          <label style={fieldLabel}>
            Speciality
            <input value={form.speciality} onChange={e => set('speciality', e.target.value)}
              placeholder="e.g. Literacy — Sounders & Decoders" style={inputStyle} />
          </label>
          <label style={fieldLabel}>
            Rate per Hour (HKD)
            <input type="number" value={form.ratePerHour} onChange={e => set('ratePerHour', e.target.value)} style={inputStyle} />
          </label>
          <div style={fieldLabel}>
            Colour
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => set('color', c)} style={{
                  width: 28, height: 28, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                  outline: form.color === c ? '3px solid #1A1A2E' : '2px solid transparent',
                  outlineOffset: 2,
                }} />
              ))}
            </div>
          </div>
          {error && <div style={{ color: '#DC2626', fontSize: 13 }}>{error}</div>}
        </div>
        <div style={{ padding: '12px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={create.isPending} style={primaryBtn}>
            {create.isPending ? 'Creating…' : 'Create Teacher'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Teacher Detail Panel ─────────────────────────────────────────────────────

function TeacherPanel({ teacher, onClose }: { teacher: AdminTeacher; onClose: () => void }) {
  const { data: detail, isLoading } = useAdminTeacherDetail(teacher.id)
  const confirm  = useConfirmPayslip()
  const [showPayslipModal, setShowPayslipModal] = useState(false)
  const [tab, setTab] = useState<'sessions' | 'payslips' | 'availability'>('sessions')

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 900,
      display: 'flex', justifyContent: 'flex-end',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}
        onClick={onClose} />
      <div style={{
        position: 'relative', width: 560, background: '#fff',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: teacher.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 18,
              }}>
                {teacher.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#1A1A2E' }}>{teacher.name}</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>{teacher.speciality}</div>
              </div>
            </div>
            <button onClick={onClose} style={iconBtn}><X size={18} /></button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 16 }}>
            {[
              { icon: <Users size={14} />, label: 'Sessions', value: teacher.sessionsThisMonth },
              { icon: <Clock size={14} />, label: 'Hours', value: `${teacher.hoursThisMonth}h` },
              { icon: <DollarSign size={14} />, label: 'Est. Pay', value: fmt(teacher.estimatedPayThisMonth) },
            ].map(s => (
              <div key={s.label} style={{
                background: '#F9FAFB', borderRadius: 10, padding: '12px 14px',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6B7280', fontSize: 12 }}>
                  {s.icon} {s.label}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1A1A2E' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #F3F4F6', padding: '0 24px' }}>
          {(['sessions', 'payslips', 'availability'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 14px', border: 'none', background: 'none',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              borderBottom: tab === t ? '2px solid #1A1A2E' : '2px solid transparent',
              color: tab === t ? '#1A1A2E' : '#6B7280',
              textTransform: 'capitalize',
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {isLoading ? (
            <div style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 40 }}>Loading…</div>
          ) : tab === 'sessions' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(detail?.sessions ?? []).length === 0 ? (
                <div style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                  No sessions this month
                </div>
              ) : detail?.sessions.map(s => (
                <div key={s.id} style={{
                  padding: '12px 14px', background: '#F9FAFB', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1A1A2E' }}>{s.student.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                      {s.displayDateTime} · {s.durationMin} min
                    </div>
                    <div style={{ fontSize: 11, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: s.programme.color, display: 'inline-block',
                      }} />
                      <span style={{ color: '#6B7280' }}>{s.programme.name}</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                    background: s.status === 'COMPLETED' ? '#ECFDF5' : '#F3F4F6',
                    color: s.status === 'COMPLETED' ? '#059669' : '#6B7280',
                  }}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          ) : tab === 'payslips' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowPayslipModal(true)} style={primaryBtn}>
                  <Plus size={13} /> Generate Payslip
                </button>
              </div>
              {(detail?.payslips ?? []).length === 0 ? (
                <div style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                  No payslips yet
                </div>
              ) : detail?.payslips.map((p: AdminPayslip) => (
                <div key={p.id} style={{
                  border: '1px solid #F3F4F6', borderRadius: 10, padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {p.periodStart} – {p.periodEnd}
                      </div>
                      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                        {p.totalHours}h · {fmt(p.grossAmount)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <PayslipBadge status={p.status} />
                      {p.status === 'DRAFT' && (
                        <button
                          onClick={() => confirm.mutate(p.id)}
                          disabled={confirm.isPending}
                          style={{ ...primaryBtn, fontSize: 12, padding: '5px 10px' }}
                        >
                          <Check size={12} /> Confirm
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Weekly Pattern</div>
              <AvailabilityGrid pattern={detail?.availability?.weeklyPattern as Record<string, unknown> | null | undefined} />
              {(detail?.availability?.exceptions ?? []).length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Exceptions</div>
                  {(detail!.availability!.exceptions as { startDate: string; endDate?: string; reason?: string }[]).map((ex, i) => (
                    <div key={i} style={{
                      padding: '8px 12px', background: '#FEF9EC', borderRadius: 8,
                      fontSize: 13, color: '#B45309', marginBottom: 6,
                    }}>
                      {ex.startDate === ex.endDate || !ex.endDate ? ex.startDate : `${ex.startDate} – ${ex.endDate}`}
                      {ex.reason ? ` — ${ex.reason}` : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showPayslipModal && (
        <PayslipModal
          teacherId={teacher.id}
          teacherName={teacher.name}
          onClose={() => setShowPayslipModal(false)}
        />
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminTeachers() {
  const { data: teachers = [], isLoading } = useAdminTeachers()
  const [selected, setSelected] = useState<AdminTeacher | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  useEffect(() => { document.title = 'Teachers — Our Learning Portal' }, [])

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E', margin: 0 }}>Teachers</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
            {teachers.length} teacher{teachers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} style={primaryBtn}>
          <Plus size={14} /> Add Teacher
        </button>
      </div>

      {/* Teacher cards */}
      {isLoading ? (
        <div style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 40 }}>Loading…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {teachers.map(t => (
            <div key={t.id}
              onClick={() => setSelected(t)}
              style={{
                background: '#fff', borderRadius: 14, padding: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                cursor: 'pointer', transition: 'box-shadow 0.15s',
                border: '2px solid transparent',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 16,
                  }}>
                    {t.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1A1A2E', fontSize: 15 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{t.speciality}</div>
                  </div>
                </div>
                <ChevronRight size={16} color="#9CA3AF" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { label: 'Sessions', value: t.sessionsThisMonth, icon: <FileText size={12} /> },
                  { label: 'Hours', value: `${t.hoursThisMonth}h`, icon: <Clock size={12} /> },
                  { label: 'Est. Pay', value: fmt(t.estimatedPayThisMonth), icon: <DollarSign size={12} /> },
                ].map(s => (
                  <div key={s.label} style={{
                    background: '#F9FAFB', borderRadius: 8, padding: '8px 10px',
                    display: 'flex', flexDirection: 'column', gap: 2,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#9CA3AF', fontSize: 11 }}>
                      {s.icon} {s.label}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A2E' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, fontSize: 12, color: '#6B7280' }}>
                Rate: {fmt(t.ratePerHour)}/hr · {t.email}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <TeacherPanel teacher={selected} onClose={() => setSelected(null)} />
      )}
      {showCreate && (
        <CreateTeacherModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const modalOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1100, padding: 20,
}
const modalBox: React.CSSProperties = {
  background: '#fff', borderRadius: 16,
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
}
const modalHeader: React.CSSProperties = {
  padding: '16px 20px', borderBottom: '1px solid #F3F4F6',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB',
  borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff',
  boxSizing: 'border-box',
}
const fieldLabel: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 6,
  fontSize: 13, fontWeight: 600, color: '#374151',
}
const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#6B7280', display: 'flex', alignItems: 'center', padding: 4,
}
const primaryBtn: React.CSSProperties = {
  padding: '7px 14px', background: '#1A1A2E', color: '#fff',
  border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
  fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
}
const cancelBtn: React.CSSProperties = {
  padding: '7px 14px', background: '#F3F4F6', color: '#374151',
  border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
  fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
}
