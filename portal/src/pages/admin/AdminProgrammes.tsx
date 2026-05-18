import { useState, useEffect } from 'react'
import { Plus, X, Edit2, BookMarked } from 'lucide-react'
import {
  useAdminProgrammes, useAdminTeachers,
  useCreateProgramme, useUpdateProgramme,
  type AdminProgramme,
} from '../../hooks/admin'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'MATHS',   label: 'Math',    color: '#F5C842', bg: '#FFFBEB' },
  { value: 'SCIENCE', label: 'Science', color: '#4AADBC', bg: '#F0FDFE' },
  { value: 'ENGLISH', label: 'English', color: '#06D6A0', bg: '#F0FDF9' },
  { value: 'OTHER',   label: 'Other',   color: '#9B5DE5', bg: '#F5F3FF' },
]

const PALETTE = [
  '#F5C842', '#E8623A', '#4AADBC', '#9B5DE5',
  '#06D6A0', '#F0A94A', '#EF4444', '#3B82F6',
  '#10B981', '#8B5CF6', '#F59E0B', '#EC4899',
]

const MASCOTS = ['🦊', '🦉', '🔬', '🎨', '✏️', '🎵', '🚀', '🌟', '🦋', '🐬', '🎯', '🏆']

const DURATIONS = [30, 45, 60, 90, 120]

function getCatMeta(value: string) {
  return CATEGORIES.find(c => c.value === value) ?? CATEGORIES[3]
}

// ─── Programme Form ───────────────────────────────────────────────────────────

interface FormState {
  name: string
  description: string
  category: string
  defaultDurationMin: number
  color: string
  mascot: string
  teachers: string[]
}

function ProgrammeModal({
  initial,
  onClose,
}: {
  initial?: AdminProgramme
  onClose: () => void
}) {
  const { data: teachers = [] } = useAdminTeachers()
  const create = useCreateProgramme()
  const update = useUpdateProgramme()

  const [form, setForm] = useState<FormState>(() => ({
    name:               initial?.name               ?? '',
    description:        initial?.description        ?? '',
    category:           initial?.category           ?? 'ENGLISH',
    defaultDurationMin: initial?.defaultDurationMin ?? 60,
    color:              initial?.color              ?? '#4AADBC',
    mascot:             initial?.mascot             ?? '🌟',
    teachers:           initial?.teachers           ?? [],
  }))
  const [error, setError] = useState('')

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function toggleTeacher(id: string) {
    setForm(f => ({
      ...f,
      teachers: f.teachers.includes(id)
        ? f.teachers.filter(t => t !== id)
        : [...f.teachers, id],
    }))
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setError('Programme name is required'); return }
    try {
      if (initial) {
        await update.mutateAsync({ id: initial.id, ...form })
      } else {
        await create.mutateAsync(form)
      }
      onClose()
    } catch { /* toast in hook */ }
  }

  const isPending = create.isPending || update.isPending

  return (
    <div style={overlay}>
      <div style={{ ...modalBox, width: 560, maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${form.color}22`, border: `2px solid ${form.color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>
              {form.mascot}
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#1A1A2E' }}>
              {initial ? 'Edit Programme' : 'New Programme'}
            </span>
          </div>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Name */}
          <label style={fieldLabel}>
            Programme Name *
            <input
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="e.g. Math Explorers"
              style={inputStyle}
            />
          </label>

          {/* Description */}
          <label style={fieldLabel}>
            Description
            <textarea
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              placeholder="Brief description of what students will learn…"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </label>

          {/* Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Category</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setField('category', cat.value)}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600,
                    border: form.category === cat.value ? `2px solid ${cat.color}` : '1.5px solid #E5E7EB',
                    background: form.category === cat.value ? cat.bg : '#fff',
                    color: form.category === cat.value ? cat.color : '#6B7280',
                    transition: 'all 0.12s',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Default Session Length</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {DURATIONS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setField('defaultDurationMin', d)}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 8, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600,
                    border: form.defaultDurationMin === d ? '2px solid #1A1A2E' : '1.5px solid #E5E7EB',
                    background: form.defaultDurationMin === d ? '#1A1A2E' : '#fff',
                    color: form.defaultDurationMin === d ? '#fff' : '#6B7280',
                    transition: 'all 0.12s',
                  }}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          {/* Colour */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Colour</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PALETTE.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setField('color', c)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', background: c,
                    border: form.color === c ? `3px solid #1A1A2E` : '3px solid transparent',
                    outline: form.color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: 2, cursor: 'pointer', transition: 'all 0.1s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Mascot */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Mascot</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {MASCOTS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setField('mascot', m)}
                  style={{
                    width: 40, height: 40, borderRadius: 10, fontSize: 20,
                    border: form.mascot === m ? `2px solid ${form.color}` : '1.5px solid #E5E7EB',
                    background: form.mascot === m ? `${form.color}18` : '#fff',
                    cursor: 'pointer', transition: 'all 0.1s',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Teachers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
              Assigned Teachers
              <span style={{ fontWeight: 400, color: '#9CA3AF', marginLeft: 6 }}>
                ({form.teachers.length} selected)
              </span>
            </span>
            <div style={{
              border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden',
              maxHeight: 220, overflowY: 'auto',
            }}>
              {teachers.map((t, i) => {
                const selected = form.teachers.includes(t.id)
                return (
                  <label
                    key={t.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', cursor: 'pointer',
                      borderTop: i === 0 ? 'none' : '1px solid #F9FAFB',
                      background: selected ? `${form.color}0D` : '#fff',
                      transition: 'background 0.1s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleTeacher(t.id)}
                      style={{ width: 16, height: 16, accentColor: form.color }}
                    />
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                      background: t.color, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#1A1A2E',
                    }}>
                      {t.firstName[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: selected ? 700 : 500, color: '#1A1A2E' }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>{t.speciality}</div>
                    </div>
                    {selected && (
                      <div style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                        background: `${form.color}22`, color: form.color,
                      }}>
                        Assigned
                      </div>
                    )}
                  </label>
                )
              })}
            </div>
          </div>

          {error && <div style={{ color: '#DC2626', fontSize: 13 }}>{error}</div>}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px', borderTop: '1px solid #F3F4F6',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          background: '#FAFAFA',
        }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={isPending} style={primaryBtn}>
            {isPending ? 'Saving…' : initial ? 'Save Changes' : 'Create Programme'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Programme Card ───────────────────────────────────────────────────────────

function ProgrammeCard({
  programme,
  teacherMap,
  onEdit,
}: {
  programme: AdminProgramme
  teacherMap: Record<string, string>
  onEdit: () => void
}) {
  const cat = getCatMeta(programme.category)
  const assignedTeachers = programme.teachers.map(id => teacherMap[id]).filter(Boolean)

  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: `1px solid #E8E6E1`,
      borderTop: `3px solid ${programme.color}`,
      padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
      boxShadow: '0 1px 4px rgba(0,0,0,.04)',
      transition: 'box-shadow 0.15s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: `${programme.color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>
            {programme.mascot}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 15, fontWeight: 800, color: '#1A1A2E',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {programme.name}
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '2px 8px', borderRadius: 99, marginTop: 3,
              background: cat.bg, color: cat.color, fontSize: 11, fontWeight: 700,
            }}>
              {cat.label}
            </span>
          </div>
        </div>
        <button
          onClick={onEdit}
          style={{
            padding: '5px 10px', borderRadius: 8, border: '1px solid #E5E7EB',
            background: '#fff', cursor: 'pointer', color: '#6B7280',
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
            flexShrink: 0,
          }}
        >
          <Edit2 size={12} /> Edit
        </button>
      </div>

      {/* Description */}
      {programme.description && (
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
          {programme.description}
        </p>
      )}

      {/* Meta row */}
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#9CA3AF', flexWrap: 'wrap' }}>
        <span>⏱ {programme.defaultDurationMin} min sessions</span>
      </div>

      {/* Teachers */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', marginBottom: 6 }}>
          ASSIGNED TEACHERS
        </div>
        {assignedTeachers.length === 0 ? (
          <span style={{ fontSize: 13, color: '#D1D5DB', fontStyle: 'italic' }}>No teachers assigned</span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {assignedTeachers.map(name => (
              <span key={name} style={{
                padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                background: `${programme.color}15`, color: programme.color,
                border: `1px solid ${programme.color}30`,
              }}>
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminProgrammes() {
  const { data: programmes = [], isLoading } = useAdminProgrammes()
  const { data: teachers = [] }              = useAdminTeachers()
  const [showCreate, setShowCreate]          = useState(false)
  const [editing, setEditing]                = useState<AdminProgramme | null>(null)
  const [catFilter, setCatFilter]            = useState('')

  useEffect(() => { document.title = 'Programmes — Our Learning Portal' }, [])

  const teacherMap = Object.fromEntries(teachers.map(t => [t.id, t.name]))

  const filtered = catFilter
    ? programmes.filter(p => p.category === catFilter)
    : programmes

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E', margin: 0 }}>Programmes</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
            {programmes.length} programme{programmes.length !== 1 ? 's' : ''} · manage your course catalogue
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} style={primaryBtn}>
          <Plus size={15} /> New Programme
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => setCatFilter('')}
          style={{
            padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            border: catFilter === '' ? '2px solid #1A1A2E' : '1.5px solid #E5E7EB',
            background: catFilter === '' ? '#1A1A2E' : '#fff',
            color: catFilter === '' ? '#fff' : '#6B7280',
          }}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCatFilter(cat.value)}
            style={{
              padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: catFilter === cat.value ? `2px solid ${cat.color}` : '1.5px solid #E5E7EB',
              background: catFilter === cat.value ? cat.bg : '#fff',
              color: catFilter === cat.value ? cat.color : '#6B7280',
              transition: 'all 0.12s',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 16, border: '1px solid #E8E6E1',
              height: 240, opacity: 0.4, animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          padding: '80px 24px', textAlign: 'center', color: '#9CA3AF',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <BookMarked size={40} strokeWidth={1.2} />
          <div style={{ fontSize: 15, fontWeight: 700, color: '#6B7280' }}>No programmes found</div>
          <div style={{ fontSize: 13 }}>
            {catFilter ? 'Try a different category filter' : 'Create your first programme to get started'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(p => (
            <ProgrammeCard
              key={p.id}
              programme={p}
              teacherMap={teacherMap}
              onEdit={() => setEditing(p)}
            />
          ))}
        </div>
      )}

      {showCreate && <ProgrammeModal onClose={() => setShowCreate(false)} />}
      {editing    && <ProgrammeModal initial={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: 20,
}
const modalBox: React.CSSProperties = {
  background: '#fff', borderRadius: 18,
  boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
  display: 'flex', flexDirection: 'column',
  overflow: 'hidden',
}
const modalHeader: React.CSSProperties = {
  padding: '18px 22px', borderBottom: '1px solid #F3F4F6',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB',
  borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff',
  boxSizing: 'border-box', color: '#1A1A2E',
}
const fieldLabel: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 6,
  fontSize: 13, fontWeight: 600, color: '#374151',
}
const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#6B7280', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6,
}
const primaryBtn: React.CSSProperties = {
  padding: '9px 16px', background: '#1A1A2E', color: '#fff',
  border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700,
  fontSize: 14, display: 'flex', alignItems: 'center', gap: 7,
}
const cancelBtn: React.CSSProperties = {
  padding: '9px 16px', background: '#F3F4F6', color: '#374151',
  border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 600,
  fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
}
