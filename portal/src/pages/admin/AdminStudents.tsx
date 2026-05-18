import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import {
  Plus, Search, ChevronRight, X, Phone, Mail,
  User, BookOpen, Archive, Edit2, ExternalLink,
} from 'lucide-react'
import {
  useAdminStudents, useAdminStudent,
  useCreateStudent, useUpdateStudent, useArchiveStudent,
  useAdminProgrammes, useAdminParents,
} from '../../hooks/admin'
import type { AdminStudent } from '../../hooks/admin'
import { Skeleton } from '../../components/ui/Skeleton'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PKG_LABEL: Record<string, string> = { MONTHLY: 'Monthly', BUNDLE_12: 'Bundle 12', BUNDLE_24: 'Bundle 24' }


function colourDot(color: string) {
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, marginRight: 4, flexShrink: 0 }} />
}

// ─── Student Detail Panel ─────────────────────────────────────────────────────

function DetailPanel({ studentId, onClose, onEdit }: { studentId: string; onClose: () => void; onEdit: (s: AdminStudent) => void }) {
  const { data: s, isLoading } = useAdminStudent(studentId)
  const archiveMutation = useArchiveStudent()
  const [confirmArchive, setConfirmArchive] = useState(false)

  if (isLoading || !s) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#D1D5DB' }}>
        Loading…
      </div>
    )
  }

  async function handleArchive() {
    await archiveMutation.mutateAsync(s!.id)
    onClose()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Panel header */}
      <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid #F0EDE8', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: '#1A1A2E' }}>{s.name}</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>
            Age {s.age} · DOB {format(parseISO(s.dateOfBirth), 'd MMM yyyy')}
          </div>
        </div>
        <button onClick={onClose} style={{ padding: 6, borderRadius: 8, border: 'none', background: '#F5F3EF', cursor: 'pointer' }}>
          <X size={16} color="#6B7280" />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px 22px' }}>

        {/* Programmes */}
        <Section title="Enrolled Programmes" icon={<BookOpen size={14} />}>
          {s.enrollments.map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: '#F8F7F4', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {colourDot(e.programme.color)}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>{e.programme.name}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>Since {e.startDate}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A2E' }}>{PKG_LABEL[e.packageType]}</div>
                {e.remaining !== null && (
                  <div style={{ fontSize: 11, color: e.remaining < 3 ? '#DC2626' : '#9CA3AF' }}>
                    {e.remaining} left
                  </div>
                )}
              </div>
            </div>
          ))}
        </Section>

        {/* Parent */}
        <Section title="Parent / Guardian" icon={<User size={14} />}>
          <div style={{ padding: '10px 12px', borderRadius: 10, background: '#F8F7F4' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>{s.parent.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <a href={`mailto:${s.parent.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#4AADBC', textDecoration: 'none' }}>
                <Mail size={12} />{s.parent.email}
              </a>
              {s.parent.phone && (
                <a href={`https://wa.me/${s.parent.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#16A34A', textDecoration: 'none' }}>
                  <Phone size={12} />{s.parent.phone} <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        </Section>

        {/* Upcoming sessions */}
        {s.upcomingSessions.length > 0 && (
          <Section title="Next Classes" icon={<BookOpen size={14} />}>
            {s.upcomingSessions.map(sess => (
              <div key={sess.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, background: '#F8F7F4', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A2E' }}>{sess.displayDateTime}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{sess.programme} · {sess.teacher}</div>
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{sess.durationMin}m</div>
              </div>
            ))}
          </Section>
        )}

        {/* Notes */}
        {s.notes && (
          <Section title="Notes" icon={<BookOpen size={14} />}>
            <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, padding: '8px 12px', background: '#FFFBEB', borderRadius: 10, border: '1px solid #FDE68A' }}>
              {s.notes}
            </div>
          </Section>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '14px 22px', borderTop: '1px solid #F0EDE8', display: 'flex', gap: 8 }}>
        <button
          onClick={() => onEdit(s as AdminStudent)}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 10, border: '1px solid #E8E6E1', background: '#fff', color: '#1A1A2E', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          <Edit2 size={14} />Edit
        </button>
        {!s.archived && (
          confirmArchive ? (
            <div style={{ flex: 1, display: 'flex', gap: 6 }}>
              <button onClick={() => setConfirmArchive(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: '1px solid #E8E6E1', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleArchive} disabled={archiveMutation.isPending} style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', background: '#DC2626', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Confirm
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmArchive(true)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 10, border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              <Archive size={14} />Archive
            </button>
          )
        )}
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
        {icon}{title}
      </div>
      {children}
    </div>
  )
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

interface StudentFormData {
  firstName: string
  lastName: string
  dateOfBirth: string
  parentId: string
  notes: string
  packageType: 'MONTHLY' | 'BUNDLE_12' | 'BUNDLE_24'
  programmeIds: string[]
}

function StudentModal({ initial, onClose }: { initial?: AdminStudent | null; onClose: () => void }) {
  const { data: programmes = [] } = useAdminProgrammes()
  const { data: parents = [] } = useAdminParents()
  const createMutation = useCreateStudent()
  const updateMutation = useUpdateStudent()

  const [form, setForm] = useState<StudentFormData>(() => {
    if (initial) {
      const nameParts = initial.name.split(' ')
      return {
        firstName:   nameParts[0] ?? '',
        lastName:    nameParts.slice(1).join(' '),
        dateOfBirth: format(parseISO(initial.dateOfBirth), 'yyyy-MM-dd'),
        parentId:    initial.parent.id,
        notes:       initial.notes ?? '',
        packageType: (initial.enrollments[0]?.packageType ?? 'MONTHLY') as StudentFormData['packageType'],
        programmeIds: initial.enrollments.map(e => e.programme.id),
      }
    }
    return { firstName: '', lastName: '', dateOfBirth: '', parentId: '', notes: '', packageType: 'MONTHLY', programmeIds: [] }
  })
  const [error, setError] = useState('')
  const [parentSearch, setParentSearch] = useState(initial ? parents.find(p => p.id === initial.parent.id)?.name ?? '' : '')
  const [showParentDrop, setShowParentDrop] = useState(false)

  const filteredParents = parents.filter(p => p.name.toLowerCase().includes(parentSearch.toLowerCase()))

  function toggleProgramme(id: string) {
    setForm(f => ({
      ...f,
      programmeIds: f.programmeIds.includes(id) ? f.programmeIds.filter(x => x !== id) : [...f.programmeIds, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.firstName || !form.lastName) { setError('First and last name are required'); return }
    if (!form.dateOfBirth) { setError('Date of birth is required'); return }
    if (!form.parentId) { setError('Please select a parent'); return }
    if (form.programmeIds.length === 0) { setError('Select at least one programme'); return }

    try {
      if (initial) {
        await updateMutation.mutateAsync({ id: initial.id, firstName: form.firstName, lastName: form.lastName, dateOfBirth: form.dateOfBirth, notes: form.notes || undefined })
      } else {
        await createMutation.mutateAsync({
          firstName: form.firstName,
          lastName: form.lastName,
          dateOfBirth: form.dateOfBirth,
          parentId: form.parentId,
          notes: form.notes || undefined,
          enrollments: form.programmeIds.map(pid => ({ programmeId: pid, packageType: form.packageType })),
        })
      }
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const literacyProgs = programmes.filter(p => p.category === 'LITERACY')
  const mathsProgs    = programmes.filter(p => p.category === 'MATHS')
  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.18)' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F0EDE8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A2E' }}>{initial ? 'Edit Student' : 'Add Student'}</div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, border: 'none', background: '#F5F3EF', cursor: 'pointer' }}><X size={16} color="#6B7280" /></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <Field label="First name">
              <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="e.g. Jake" style={inputStyle} />
            </Field>
            <Field label="Last name">
              <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="e.g. Lam" style={inputStyle} />
            </Field>
          </div>

          {/* DOB */}
          <div style={{ marginBottom: 14 }}>
            <Field label="Date of birth">
              <input type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} style={inputStyle} />
            </Field>
          </div>

          {/* Parent */}
          {!initial && (
            <div style={{ marginBottom: 14, position: 'relative' }}>
              <Field label="Parent / Guardian">
                <input
                  value={parentSearch}
                  onChange={e => { setParentSearch(e.target.value); setShowParentDrop(true) }}
                  onFocus={() => setShowParentDrop(true)}
                  placeholder="Search parent name…"
                  style={inputStyle}
                />
                {form.parentId && (
                  <div style={{ fontSize: 12, color: '#16A34A', marginTop: 4, fontWeight: 600 }}>
                    ✓ {parents.find(p => p.id === form.parentId)?.name}
                  </div>
                )}
                {showParentDrop && filteredParents.length > 0 && (
                  <div style={{ position: 'absolute', zIndex: 20, top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #E8E6E1', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.1)', maxHeight: 180, overflowY: 'auto' }}>
                    {filteredParents.map(p => (
                      <button key={p.id} type="button" onClick={() => { setForm(f => ({ ...f, parentId: p.id })); setParentSearch(p.name); setShowParentDrop(false) }}
                        style={{ width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#1A1A2E' }}>
                        {p.name} <span style={{ color: '#9CA3AF', fontSize: 11 }}>{p.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </Field>
            </div>
          )}

          {/* Programmes */}
          {!initial && (
            <>
              <Field label="Programme(s)">
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 6 }}>LITERACY</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {literacyProgs.map(p => (
                      <button key={p.id} type="button" onClick={() => toggleProgramme(p.id)}
                        style={{ padding: '5px 10px', borderRadius: 999, border: `2px solid ${form.programmeIds.includes(p.id) ? p.color : '#E8E6E1'}`, background: form.programmeIds.includes(p.id) ? `${p.color}22` : '#fff', fontSize: 12, fontWeight: 600, color: form.programmeIds.includes(p.id) ? '#1A1A2E' : '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {form.programmeIds.includes(p.id) && colourDot(p.color)}
                        {p.name.length > 12 ? p.name.split(' ')[0] : p.name}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 6 }}>MATHS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {mathsProgs.map(p => (
                      <button key={p.id} type="button" onClick={() => toggleProgramme(p.id)}
                        style={{ padding: '5px 10px', borderRadius: 999, border: `2px solid ${form.programmeIds.includes(p.id) ? p.color : '#E8E6E1'}`, background: form.programmeIds.includes(p.id) ? `${p.color}22` : '#fff', fontSize: 12, fontWeight: 600, color: form.programmeIds.includes(p.id) ? '#1A1A2E' : '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {form.programmeIds.includes(p.id) && colourDot(p.color)}
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </Field>

              {/* Package type */}
              <div style={{ marginTop: 16, marginBottom: 14 }}>
                <Field label="Lesson package">
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    {(['MONTHLY', 'BUNDLE_12', 'BUNDLE_24'] as const).map(pkg => (
                      <label key={pkg} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 10, border: `2px solid ${form.packageType === pkg ? '#4AADBC' : '#E8E6E1'}`, background: form.packageType === pkg ? '#EFF9FB' : '#fff', fontSize: 12, fontWeight: 700, color: form.packageType === pkg ? '#4AADBC' : '#6B7280', cursor: 'pointer' }}>
                        <input type="radio" name="pkg" value={pkg} checked={form.packageType === pkg} onChange={() => setForm(f => ({ ...f, packageType: pkg }))} style={{ display: 'none' }} />
                        {PKG_LABEL[pkg]}
                      </label>
                    ))}
                  </div>
                </Field>
              </div>
            </>
          )}

          {/* Notes */}
          <div style={{ marginBottom: 6 }}>
            <Field label="Notes (optional)">
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any relevant notes about the student…" rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
            </Field>
          </div>

          {error && <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: '#FEF2F2', color: '#DC2626', fontSize: 13 }}>{error}</div>}
        </form>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #F0EDE8', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid #E8E6E1', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#4B5563' }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={isPending}
            style={{ flex: 2, padding: '10px 0', borderRadius: 10, border: 'none', background: '#4AADBC', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
          >
            {isPending ? 'Saving…' : initial ? 'Save Changes' : 'Add Student'}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: '1px solid #E8E6E1', background: '#fff',
  fontSize: 13, color: '#1A1A2E', boxSizing: 'border-box',
  outline: 'none', fontFamily: 'inherit',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} style={{ borderBottom: '1px solid #F5F3EF' }}>
          {[140, 40, 160, 80, 90, 60, 24].map((w, j) => (
            <td key={j} style={{ padding: '12px 16px' }}>
              <Skeleton width={w} height={14} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ─── Mobile card list ─────────────────────────────────────────────────────────

function MobileStudentCard({ s, onClick }: { s: AdminStudent; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      padding: '14px 16px', borderBottom: '1px solid #F5F3EF',
      background: '#fff', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: s.enrollments[0] ? `${s.enrollments[0].programme.color}22` : '#F3F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 800, color: s.enrollments[0]?.programme.color ?? '#9CA3AF',
      }}>
        {s.name.charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A2E' }}>{s.name}</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
          Age {s.age} · {s.enrollments.map(e => e.programme.name.split(' ')[0]).join(', ')}
        </div>
      </div>
      <span style={{
        padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
        background: s.archived ? '#F3F4F6' : '#ECFDF5',
        color: s.archived ? '#6B7280' : '#16A34A',
      }}>
        {s.archived ? 'Archived' : 'Active'}
      </span>
    </div>
  )
}

// ─── Main Students Page ───────────────────────────────────────────────────────

export default function AdminStudents() {
  const [search, setSearch] = useState('')
  const [programmeFilter, setProgrammeFilter] = useState('')
  const [pkgFilter, setPkgFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived'>('active')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingStudent, setEditingStudent] = useState<AdminStudent | null | undefined>(undefined)

  useEffect(() => { document.title = 'Students — Our Learning Portal' }, [])

  const { data: students = [], isLoading } = useAdminStudents({
    search: search || undefined,
    programme: programmeFilter || undefined,
    packageType: pkgFilter || undefined,
    status: statusFilter,
  })
  const { data: programmes = [] } = useAdminProgrammes()

  const showModal  = editingStudent !== undefined   // undefined = closed, null = create, AdminStudent = edit

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* Main table area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '24px 28px 16px', background: '#fff', borderBottom: '1px solid #F0EDE8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1A1A2E', margin: 0 }}>Students</h1>
            <button
              onClick={() => setEditingStudent(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: 'none', background: '#4AADBC', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              <Plus size={16} />Add Student
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search student or parent…"
                style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 10, border: '1px solid #E8E6E1', background: '#F8F7F4', fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            {/* Programme filter */}
            <select value={programmeFilter} onChange={e => setProgrammeFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #E8E6E1', background: '#F8F7F4', fontSize: 13, color: '#4B5563', cursor: 'pointer', outline: 'none' }}>
              <option value="">All Programmes</option>
              {programmes.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
            </select>

            {/* Package filter */}
            <select value={pkgFilter} onChange={e => setPkgFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #E8E6E1', background: '#F8F7F4', fontSize: 13, color: '#4B5563', cursor: 'pointer', outline: 'none' }}>
              <option value="">All Packages</option>
              <option value="MONTHLY">Monthly</option>
              <option value="BUNDLE_12">Bundle 12</option>
              <option value="BUNDLE_24">Bundle 24</option>
            </select>

            {/* Status toggle */}
            <div style={{ display: 'flex', background: '#F0EDE8', borderRadius: 10, padding: 3 }}>
              {(['active', 'archived'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: statusFilter === s ? '#fff' : 'transparent', color: statusFilter === s ? '#1A1A2E' : '#9CA3AF', fontWeight: 700, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table (desktop) / Card list (mobile) */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <>
              {/* Mobile skeleton */}
              <div className="block sm:hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid #F5F3EF', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Skeleton width={40} height={40} borderRadius={12} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <Skeleton height={14} width="55%" />
                      <Skeleton height={11} width="70%" />
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop skeleton */}
              <div className="hidden sm:block">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8F7F4', borderBottom: '1px solid #F0EDE8' }}>
                      {['Name', 'Age', 'Programme(s)', 'Package', 'Teacher', 'Status', ''].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody><SkeletonRows /></tbody>
                </table>
              </div>
            </>
          ) : students.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: 12, color: '#9CA3AF', textAlign: 'center' }}>
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <circle cx="26" cy="26" r="20" stroke="#E5E7EB" strokeWidth="3"/>
                <line x1="41" y1="41" x2="54" y2="54" stroke="#E5E7EB" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#6B7280' }}>
                {search ? 'No students match your search' : 'No students found'}
              </div>
              <div style={{ fontSize: 13, color: '#9CA3AF' }}>
                {search ? 'Try a different name or clear your search' : 'Add a student to get started'}
              </div>
            </div>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="block sm:hidden">
                {students.map(s => (
                  <MobileStudentCard key={s.id} s={s} onClick={() => setSelectedId(s.id)} />
                ))}
              </div>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F8F7F4', borderBottom: '1px solid #F0EDE8' }}>
                      {['Name', 'Age', 'Programme(s)', 'Package', 'Teacher', 'Status', ''].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr
                        key={s.id}
                        onClick={() => setSelectedId(s.id)}
                        style={{ borderBottom: '1px solid #F5F3EF', cursor: 'pointer', background: selectedId === s.id ? '#EFF9FB' : '#fff', transition: 'background .1s' }}
                        onMouseEnter={e => { if (selectedId !== s.id) e.currentTarget.style.background = '#FAFAF9' }}
                        onMouseLeave={e => { e.currentTarget.style.background = selectedId === s.id ? '#EFF9FB' : '#fff' }}
                      >
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1A1A2E' }}>{s.name}</td>
                        <td style={{ padding: '12px 16px', color: '#6B7280' }}>{s.age}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {s.enrollments.map(e => (
                              <span key={e.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: `${e.programme.color}22`, fontSize: 11, fontWeight: 600, color: '#1A1A2E' }}>
                                {colourDot(e.programme.color)}
                                {e.programme.name.split(' ')[0]}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#6B7280' }}>
                          {s.enrollments.length > 0 ? PKG_LABEL[s.enrollments[0].packageType] : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#6B7280' }}>
                          {s.upcomingTeacher ? s.upcomingTeacher.name.split(' ').slice(1).join(' ') || s.upcomingTeacher.name : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: s.archived ? '#F3F4F6' : '#ECFDF5', color: s.archived ? '#6B7280' : '#16A34A' }}>
                            {s.archived ? 'Archived' : 'Active'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#D1D5DB' }}>
                          <ChevronRight size={16} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Side panel */}
      {selectedId && (
        <div style={{
          width: 360, flexShrink: 0, borderLeft: '1px solid #F0EDE8',
          background: '#fff', overflowY: 'auto', display: 'flex', flexDirection: 'column',
        }}>
          <DetailPanel
            studentId={selectedId}
            onClose={() => setSelectedId(null)}
            onEdit={(s) => setEditingStudent(s)}
          />
        </div>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <StudentModal
          initial={editingStudent}
          onClose={() => { setEditingStudent(undefined); }}
        />
      )}
    </div>
  )
}
