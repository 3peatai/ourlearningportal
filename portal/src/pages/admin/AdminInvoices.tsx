import { useState, useMemo, useEffect, useRef } from 'react'
import {
  FileText, Send, CheckCircle, AlertTriangle,
  Plus, Download, ChevronRight, X, Edit2, Check, Bell, Users, Search,
} from 'lucide-react'
import {
  useAdminInvoices, useAdminParents, useGenerateInvoice, useGenerateAllInvoices,
  useSendInvoice, useSendReminder, useMarkInvoicePaid, useMarkInvoiceOverdue,
  useUpdateInvoice,
  type AdminInvoice, type AdminParent,
} from '../../hooks/admin'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) { return `HKD ${Math.round(n).toLocaleString()}` }
function toIso(d: Date) { return d.toISOString().slice(0, 10) }

type Preset = 'LAST_MONTH' | 'THIS_MONTH' | 'MANUAL'

function getPresetRange(preset: Preset): { start: string; end: string } | null {
  if (preset === 'MANUAL') return null
  const now = new Date()
  if (preset === 'LAST_MONTH') {
    return {
      start: toIso(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      end:   toIso(new Date(now.getFullYear(), now.getMonth(), 0)),
    }
  }
  return {
    start: toIso(new Date(now.getFullYear(), now.getMonth(), 1)),
    end:   toIso(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  }
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  DRAFT:   { label: 'Draft',   color: '#6B7280', bg: '#F3F4F6', icon: <FileText size={12} /> },
  SENT:    { label: 'Sent',    color: '#2563EB', bg: '#EFF6FF', icon: <Send size={12} /> },
  PAID:    { label: 'Paid',    color: '#059669', bg: '#ECFDF5', icon: <CheckCircle size={12} /> },
  OVERDUE: { label: 'Overdue', color: '#DC2626', bg: '#FEF2F2', icon: <AlertTriangle size={12} /> },
}

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.DRAFT
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 99,
      background: m.bg, color: m.color, fontSize: 12, fontWeight: 600,
    }}>
      {m.icon}{m.label}
    </span>
  )
}

function getPaymentStatus(inv: AdminInvoice) {
  if (inv.status === 'PAID')    return { label: 'Paid',    color: '#059669', bg: '#ECFDF5' }
  if (inv.status === 'OVERDUE') return { label: 'Overdue', color: '#DC2626', bg: '#FEF2F2' }
  if (inv.status === 'DRAFT')   return { label: '—',       color: '#9CA3AF', bg: 'transparent' }
  // SENT
  if (!inv.dueDate) return { label: 'Due', color: '#2563EB', bg: '#EFF6FF' }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(inv.dueDate)
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0)  return { label: 'Overdue',        color: '#DC2626', bg: '#FEF2F2' }
  if (diffDays === 0) return { label: 'Due today',     color: '#D97706', bg: '#FFFBEB' }
  if (diffDays <= 7)  return { label: `Due in ${diffDays}d`, color: '#D97706', bg: '#FFFBEB' }
  return { label: 'Due', color: '#2563EB', bg: '#EFF6FF' }
}

function PaymentStatusBadge({ inv }: { inv: AdminInvoice }) {
  const ps = getPaymentStatus(inv)
  if (ps.label === '—') return <span style={{ color: '#D1D5DB', fontSize: 14 }}>—</span>
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 99,
      background: ps.bg, color: ps.color, fontSize: 12, fontWeight: 600,
    }}>
      {ps.label}
    </span>
  )
}

function monthOptions() {
  const opts = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    opts.push({ val, label })
  }
  return opts
}

// ─── Searchable Parent Select ─────────────────────────────────────────────────

function SearchableParentSelect({
  parents,
  value,
  onChange,
}: {
  parents: AdminParent[]
  value: string
  onChange: (id: string) => void
}) {
  const [query, setQuery] = useState(() => parents.find(p => p.id === value)?.name ?? '')
  const [open, setOpen]   = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = useMemo(
    () => query ? parents.filter(p => p.name.toLowerCase().includes(query.toLowerCase())) : parents,
    [query, parents],
  )

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(p: AdminParent) {
    onChange(p.id)
    setQuery(p.name)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{
          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          color: '#9CA3AF', pointerEvents: 'none',
        }} />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(''); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search by name…"
          style={{ ...inputStyle, paddingLeft: 32 }}
        />
      </div>
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 200,
          maxHeight: 200, overflowY: 'auto',
        }}>
          {filtered.map(p => (
            <div
              key={p.id}
              onMouseDown={() => select(p)}
              style={{
                padding: '9px 12px', cursor: 'pointer', fontSize: 14,
                color: p.id === value ? '#1A1A2E' : '#374151',
                background: p.id === value ? '#F0F0FF' : 'transparent',
                fontWeight: p.id === value ? 600 : 400,
              }}
            >
              {p.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Generate Invoice Modal ───────────────────────────────────────────────────

function GenerateModal({ onClose }: { onClose: () => void }) {
  const { data: parents = [] } = useAdminParents()
  const generate = useGenerateInvoice()
  const [parentId, setParentId]   = useState('')
  const [preset, setPreset]       = useState<Preset>('LAST_MONTH')
  const [manualStart, setManualStart] = useState('')
  const [manualEnd, setManualEnd]     = useState('')
  const [error, setError]         = useState('')

  const range       = preset !== 'MANUAL' ? getPresetRange(preset) : null
  const periodStart = preset === 'MANUAL' ? manualStart : (range?.start ?? '')
  const periodEnd   = preset === 'MANUAL' ? manualEnd   : (range?.end ?? '')

  async function handleSubmit() {
    if (!parentId || !periodStart || !periodEnd) { setError('All fields required'); return }
    try {
      await generate.mutateAsync({ parentId, periodStart, periodEnd })
      onClose()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } }
      setError(err?.response?.data?.error ?? 'Failed to generate')
    }
  }

  const presets: { key: Preset; label: string }[] = [
    { key: 'LAST_MONTH', label: 'Last Month' },
    { key: 'THIS_MONTH', label: 'This Month' },
    { key: 'MANUAL',     label: 'Custom'     },
  ]

  return (
    <div style={modalOverlay}>
      <div style={{ ...modalBox, width: 480 }}>
        <div style={modalHeader}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Generate Invoice</span>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Searchable client */}
          <label style={fieldLabel}>
            Parent / Family
            <SearchableParentSelect parents={parents} value={parentId} onChange={setParentId} />
          </label>

          {/* Period presets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Billing Period</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {presets.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPreset(p.key)}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 8,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: preset === p.key ? '2px solid #1A1A2E' : '1.5px solid #E5E7EB',
                    background: preset === p.key ? '#1A1A2E' : '#fff',
                    color: preset === p.key ? '#fff' : '#374151',
                    transition: 'all 0.12s',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {preset === 'MANUAL' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 2 }}>
                <label style={fieldLabel}>
                  Start
                  <input type="date" value={manualStart}
                    onChange={e => setManualStart(e.target.value)} style={inputStyle} />
                </label>
                <label style={fieldLabel}>
                  End
                  <input type="date" value={manualEnd} min={manualStart}
                    onChange={e => setManualEnd(e.target.value)} style={inputStyle} />
                </label>
              </div>
            ) : (
              <div style={{
                background: '#F9FAFB', borderRadius: 8, padding: '8px 12px',
                fontSize: 13, color: '#6B7280',
              }}>
                {periodStart} → {periodEnd}
              </div>
            )}
          </div>

          {error && <div style={{ color: '#DC2626', fontSize: 13 }}>{error}</div>}
        </div>
        <div style={{ padding: '12px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button onClick={handleSubmit} disabled={generate.isPending} style={primaryBtn}>
            {generate.isPending ? 'Generating…' : 'Generate Invoice'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Generate All Modal ───────────────────────────────────────────────────────

function GenerateAllModal({ onClose }: { onClose: () => void }) {
  const { data: parents = [] } = useAdminParents()
  const generateAll = useGenerateAllInvoices()
  const [preset, setPreset] = useState<'LAST_MONTH' | 'THIS_MONTH'>('LAST_MONTH')
  const range = getPresetRange(preset)

  async function handleSubmit() {
    try {
      await generateAll.mutateAsync({ preset, periodStart: range?.start ?? '', periodEnd: range?.end ?? '' })
      onClose()
    } catch { /* toast handled in hook */ }
  }

  return (
    <div style={modalOverlay}>
      <div style={{ ...modalBox, width: 520 }}>
        <div style={modalHeader}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Generate All Invoices</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
              Create draft invoices for all active clients
            </div>
          </div>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Period preset */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Billing Period</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['LAST_MONTH', 'THIS_MONTH'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPreset(p)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 8,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: preset === p ? '2px solid #1A1A2E' : '1.5px solid #E5E7EB',
                    background: preset === p ? '#1A1A2E' : '#fff',
                    color: preset === p ? '#fff' : '#374151',
                    transition: 'all 0.12s',
                  }}
                >
                  {p === 'LAST_MONTH' ? 'Last Month' : 'This Month'}
                </button>
              ))}
            </div>
            <div style={{
              background: '#F9FAFB', borderRadius: 8, padding: '8px 12px',
              fontSize: 13, color: '#6B7280',
            }}>
              {range?.start} → {range?.end}
            </div>
          </div>

          {/* Client list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
              Clients ({parents.length})
            </span>
            <div style={{
              border: '1px solid #F3F4F6', borderRadius: 8,
              maxHeight: 240, overflowY: 'auto',
            }}>
              {parents.map((p, i) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                  borderTop: i === 0 ? 'none' : '1px solid #F9FAFB',
                  background: i % 2 === 0 ? '#fff' : '#FAFAFA',
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', background: '#E0E7FF', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#4F46E5',
                  }}>
                    {p.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A2E' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{p.email}</div>
                  </div>
                  <CheckCircle size={14} style={{ color: '#059669', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          padding: '12px 24px', borderTop: '1px solid #F3F4F6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>
            {parents.length} invoices will be generated
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={cancelBtn}>Cancel</button>
            <button onClick={handleSubmit} disabled={generateAll.isPending} style={primaryBtn}>
              <Users size={14} />
              {generateAll.isPending ? 'Generating…' : `Generate ${parents.length} Invoices`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Line Item Editor ─────────────────────────────────────────────────────────

function LineItemEditor({ items, onChange }: {
  items: { description: string; amount: number; sessionId?: string }[]
  onChange: (items: { description: string; amount: number; sessionId?: string }[]) => void
}) {
  function update(i: number, field: 'description' | 'amount', val: string) {
    const next = items.map((item, idx) =>
      idx === i ? { ...item, [field]: field === 'amount' ? parseFloat(val) || 0 : val } : item
    )
    onChange(next)
  }
  function remove(i: number) { onChange(items.filter((_, idx) => idx !== i)) }
  function add() { onChange([...items, { description: '', amount: 0 }]) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={item.description}
            onChange={e => update(i, 'description', e.target.value)}
            placeholder="Description"
            style={{ ...inputStyle, flex: 1, fontSize: 13 }}
          />
          <input
            type="number"
            value={item.amount}
            onChange={e => update(i, 'amount', e.target.value)}
            style={{ ...inputStyle, width: 90, fontSize: 13, textAlign: 'right' }}
          />
          <button onClick={() => remove(i)} style={{ ...iconBtn, color: '#DC2626' }}><X size={14} /></button>
        </div>
      ))}
      <button onClick={add} style={{ ...cancelBtn, alignSelf: 'flex-start', fontSize: 12 }}>
        + Add line
      </button>
    </div>
  )
}

// ─── Invoice Detail Modal ─────────────────────────────────────────────────────

function InvoiceModal({ invoice, onClose }: { invoice: AdminInvoice; onClose: () => void }) {
  const send        = useSendInvoice()
  const markPaid    = useMarkInvoicePaid()
  const markOverdue = useMarkInvoiceOverdue()
  const updateInv   = useUpdateInvoice()
  const remind      = useSendReminder()

  const [editing, setEditing] = useState(false)
  const [items, setItems]     = useState<{ description: string; amount: number; sessionId?: string }[]>(
    invoice.items.map(i => ({ description: i.description, amount: i.amount, sessionId: i.session?.id }))
  )

  const editedTotal = items.reduce((s, i) => s + i.amount, 0)

  async function saveItems() {
    await updateInv.mutateAsync({ id: invoice.id, items })
    setEditing(false)
  }

  function exportSingle() {
    const rows = [
      '*ContactName,EmailAddress,*InvoiceNumber,*InvoiceDate,*DueDate,*Description,*Quantity,*UnitAmount,AccountCode,TaxType,*Currency',
    ]
    const invNum = `BB-${invoice.id.slice(-6).toUpperCase()}`
    for (const item of invoice.items) {
      rows.push([
        `"${invoice.parent.name}"`, invoice.parent.email, invNum,
        invoice.periodStart, invoice.dueDate,
        `"${item.description.replace(/"/g, '""')}"`, '1',
        item.amount.toFixed(2), '200', 'Tax Exempt (0%)', 'HKD',
      ].join(','))
    }
    if (invoice.discount > 0) {
      rows.push([
        `"${invoice.parent.name}"`, invoice.parent.email, invNum,
        invoice.periodStart, invoice.dueDate,
        '"Bundle Discount"', '1', (-invoice.discount).toFixed(2), '200', 'Tax Exempt (0%)', 'HKD',
      ].join(','))
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `invoice-${invNum}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={modalOverlay}>
      <div style={{ ...modalBox, width: 640, maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ ...modalHeader, justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              Invoice BB-{invoice.id.slice(-6).toUpperCase()}
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
              {invoice.parent.name} · {invoice.periodStart} – {invoice.periodEnd}
            </div>
          </div>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Status + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <StatusBadge status={invoice.status} />
            <PaymentStatusBadge inv={invoice} />

            {invoice.status === 'DRAFT' && (
              <button onClick={() => send.mutate(invoice.id)} disabled={send.isPending} style={primaryBtn}>
                <Send size={13} /> Send
              </button>
            )}
            {invoice.status === 'SENT' && (
              <>
                <button onClick={() => markPaid.mutate(invoice.id)} disabled={markPaid.isPending} style={primaryBtn}>
                  <CheckCircle size={13} /> Mark Paid
                </button>
                <button onClick={() => markOverdue.mutate(invoice.id)} disabled={markOverdue.isPending}
                  style={{ ...primaryBtn, background: '#FEF2F2', color: '#DC2626' }}>
                  <AlertTriangle size={13} /> Mark Overdue
                </button>
              </>
            )}
            {invoice.status === 'OVERDUE' && (
              <button onClick={() => markPaid.mutate(invoice.id)} disabled={markPaid.isPending} style={primaryBtn}>
                <CheckCircle size={13} /> Mark Paid
              </button>
            )}
            {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
              <button
                onClick={() => remind.mutate(invoice.id)}
                disabled={remind.isPending}
                style={{ ...cancelBtn, background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}
              >
                <Bell size={13} /> Send Reminder
              </button>
            )}

            <button onClick={exportSingle} style={{ ...cancelBtn, marginLeft: 'auto' }}>
              <Download size={13} /> Xero CSV
            </button>
          </div>

          {/* Line items */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Line Items</span>
            {invoice.status !== 'PAID' && !editing && (
              <button onClick={() => setEditing(true)} style={{ ...cancelBtn, fontSize: 12 }}>
                <Edit2 size={12} /> Edit
              </button>
            )}
            {editing && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setEditing(false)} style={cancelBtn}>Cancel</button>
                <button onClick={saveItems} disabled={updateInv.isPending} style={primaryBtn}>
                  <Check size={12} /> Save
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <LineItemEditor items={items} onChange={setItems} />
          ) : (
            <div style={{ border: '1px solid #F3F4F6', borderRadius: 8, overflow: 'hidden' }}>
              {invoice.items.map((item, i) => (
                <div key={item.id} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '10px 14px',
                  borderTop: i === 0 ? 'none' : '1px solid #F9FAFB',
                  background: i % 2 === 0 ? '#fff' : '#FAFAFA',
                  fontSize: 13,
                }}>
                  <span style={{ color: '#374151' }}>{item.description}</span>
                  <span style={{ fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', marginLeft: 16 }}>
                    HKD {item.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 32, fontSize: 13, color: '#6B7280' }}>
              <span>Subtotal</span>
              <span>{fmt(editing ? editedTotal : invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div style={{ display: 'flex', gap: 32, fontSize: 13, color: '#059669' }}>
                <span>Bundle Discount</span>
                <span>−{fmt(invoice.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 32, fontSize: 15, fontWeight: 700, color: '#111827' }}>
              <span>Total</span>
              <span>{fmt(editing ? editedTotal : invoice.total)}</span>
            </div>
            {invoice.dueDate && (
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>Due {invoice.dueDate}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminInvoices() {
  const months = useMemo(() => monthOptions(), [])
  const [selectedMonth, setSelectedMonth]   = useState(months[0].val)
  const [statusFilter, setStatusFilter]     = useState('')
  const [showGenerate, setShowGenerate]     = useState(false)
  const [showGenerateAll, setShowGenerateAll] = useState(false)
  const [selectedInv, setSelectedInv]       = useState<AdminInvoice | null>(null)
  const [selected, setSelected]             = useState<Set<string>>(new Set())

  const { data: invoices = [], isLoading } = useAdminInvoices({
    month: selectedMonth,
    status: statusFilter || undefined,
  })

  const sendInvoice  = useSendInvoice()
  const sendReminder = useSendReminder()

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selected.size === invoices.length) setSelected(new Set())
    else setSelected(new Set(invoices.map(i => i.id)))
  }

  async function bulkSend() {
    const draftIds = invoices.filter(i => selected.has(i.id) && i.status === 'DRAFT').map(i => i.id)
    await Promise.all(draftIds.map(id => sendInvoice.mutateAsync(id)))
    setSelected(new Set())
  }

  function exportAll() {
    const rows = [
      '*ContactName,EmailAddress,*InvoiceNumber,*InvoiceDate,*DueDate,*Description,*Quantity,*UnitAmount,AccountCode,TaxType,*Currency',
    ]
    for (const inv of invoices.filter(i => i.status !== 'DRAFT')) {
      const invNum = `BB-${inv.id.slice(-6).toUpperCase()}`
      for (const item of inv.items) {
        rows.push([
          `"${inv.parent.name}"`, inv.parent.email, invNum,
          inv.periodStart, inv.dueDate,
          `"${item.description.replace(/"/g, '""')}"`, '1',
          item.amount.toFixed(2), '200', 'Tax Exempt (0%)', 'HKD',
        ].join(','))
      }
      if (inv.discount > 0) {
        rows.push([
          `"${inv.parent.name}"`, inv.parent.email, invNum,
          inv.periodStart, inv.dueDate,
          '"Bundle Discount"', '1', (-inv.discount).toFixed(2), '200', 'Tax Exempt (0%)', 'HKD',
        ].join(','))
      }
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `invoices-xero-${selectedMonth}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const summaryTotal     = invoices.reduce((s, i) => s + i.total, 0)
  const outstandingTotal = invoices
    .filter(i => ['SENT', 'OVERDUE'].includes(i.status))
    .reduce((s, i) => s + i.total, 0)

  useEffect(() => { document.title = 'Invoices — Our Learning Portal' }, [])

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E', margin: 0 }}>Invoices</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} · {fmt(summaryTotal)} total
            {outstandingTotal > 0 && ` · ${fmt(outstandingTotal)} outstanding`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {selected.size > 0 && (
            <button onClick={bulkSend} disabled={sendInvoice.isPending} style={primaryBtn}>
              <Send size={14} /> Send {selected.size} draft{selected.size > 1 ? 's' : ''}
            </button>
          )}
          <button onClick={exportAll} style={cancelBtn}><Download size={14} /> Xero CSV</button>
          <button onClick={() => setShowGenerateAll(true)} style={cancelBtn}>
            <Users size={14} /> Generate All
          </button>
          <button onClick={() => setShowGenerate(true)} style={primaryBtn}>
            <Plus size={14} /> Generate Invoice
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          style={{ ...inputStyle, width: 200 }}
        >
          {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ ...inputStyle, width: 140 }}
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
              <th style={thStyle}>
                <input type="checkbox"
                  checked={selected.size === invoices.length && invoices.length > 0}
                  onChange={selectAll} />
              </th>
              <th style={thStyle}>Invoice #</th>
              <th style={thStyle}>Parent</th>
              <th style={thStyle}>Period</th>
              <th style={thStyle}>Due</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Payment Status</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loading…</td></tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div style={{ padding: '60px 24px', textAlign: 'center', color: '#9CA3AF', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <rect x="8" y="4" width="32" height="40" rx="4" stroke="#E5E7EB" strokeWidth="2.5"/>
                      <line x1="16" y1="16" x2="32" y2="16" stroke="#E5E7EB" strokeWidth="2"/>
                      <line x1="16" y1="24" x2="28" y2="24" stroke="#E5E7EB" strokeWidth="2"/>
                      <line x1="16" y1="32" x2="24" y2="32" stroke="#E5E7EB" strokeWidth="2"/>
                    </svg>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#6B7280' }}>No invoices yet</div>
                    <div style={{ fontSize: 13 }}>Generate an invoice to get started</div>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map(inv => (
                <tr key={inv.id}
                  style={{ borderTop: '1px solid #F9FAFB', cursor: 'pointer' }}
                  onClick={() => setSelectedInv(inv)}
                >
                  <td style={tdStyle} onClick={e => { e.stopPropagation(); toggleSelect(inv.id) }}>
                    <input type="checkbox" checked={selected.has(inv.id)}
                      onChange={() => toggleSelect(inv.id)} onClick={e => e.stopPropagation()} />
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#1A1A2E' }}>
                    BB-{inv.id.slice(-6).toUpperCase()}
                  </td>
                  <td style={tdStyle}>{inv.parent.name}</td>
                  <td style={{ ...tdStyle, color: '#6B7280', fontSize: 13 }}>
                    {inv.periodStart} – {inv.periodEnd}
                  </td>
                  <td style={{ ...tdStyle, color: '#6B7280', fontSize: 13 }}>{inv.dueDate}</td>
                  <td style={tdStyle}><StatusBadge status={inv.status} /></td>
                  <td style={tdStyle}><PaymentStatusBadge inv={inv} /></td>
                  <td style={{ ...tdStyle, fontWeight: 700, textAlign: 'right' }}>{fmt(inv.total)}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                      {(inv.status === 'SENT' || inv.status === 'OVERDUE') && (
                        <button
                          onClick={e => { e.stopPropagation(); sendReminder.mutate(inv.id) }}
                          disabled={sendReminder.isPending}
                          style={{
                            padding: '3px 8px', background: '#FFFBEB', color: '#D97706',
                            border: '1px solid #FDE68A', borderRadius: 6, cursor: 'pointer',
                            fontSize: 12, fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: 3,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Bell size={11} /> Remind
                        </button>
                      )}
                      <ChevronRight size={16} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showGenerate    && <GenerateModal    onClose={() => setShowGenerate(false)} />}
      {showGenerateAll && <GenerateAllModal onClose={() => setShowGenerateAll(false)} />}
      {selectedInv && (
        <InvoiceModal
          invoice={invoices.find(i => i.id === selectedInv.id) ?? selectedInv}
          onClose={() => setSelectedInv(null)}
        />
      )}
    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const modalOverlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: 20,
}
const modalBox: React.CSSProperties = {
  background: '#fff', borderRadius: 16,
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  display: 'flex', flexDirection: 'column',
  overflow: 'hidden',
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
const thStyle: React.CSSProperties = {
  padding: '10px 14px', textAlign: 'left',
  fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase',
}
const tdStyle: React.CSSProperties = { padding: '12px 14px', color: '#374151' }
