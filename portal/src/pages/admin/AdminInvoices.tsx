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
import { BB } from '../../lib/bb'

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

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  DRAFT:   { label: 'Draft',   color: BB.inkSoft,  bg: `${BB.bg}`,               border: 'rgba(28,42,44,0.15)', icon: <FileText size={11} /> },
  SENT:    { label: 'Sent',    color: BB.teal,     bg: `${BB.amber}33`,           border: `${BB.amber}99`,       icon: <Send size={11} /> },
  PAID:    { label: 'Paid',    color: BB.teal,     bg: `${BB.teal}15`,            border: `${BB.teal}55`,        icon: <CheckCircle size={11} /> },
  OVERDUE: { label: 'Overdue', color: BB.coral,    bg: `${BB.coral}15`,           border: `${BB.coral}55`,       icon: <AlertTriangle size={11} /> },
}

// Left-border accent per status
const STATUS_BORDER: Record<string, string> = {
  DRAFT: 'rgba(28,42,44,0.2)',
  SENT:  BB.amber,
  PAID:  BB.teal,
  OVERDUE: BB.coral,
}

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.DRAFT
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 99,
      background: m.bg, color: m.color, fontSize: 11, fontWeight: 700,
      border: `1px solid ${m.border}`, letterSpacing: 0.2,
    }}>
      {m.icon}{m.label}
    </span>
  )
}

function getPaymentStatus(inv: AdminInvoice) {
  if (inv.status === 'PAID')    return { label: 'Paid',    color: BB.teal,  bg: `${BB.teal}15`  }
  if (inv.status === 'OVERDUE') return { label: 'Overdue', color: BB.coral, bg: `${BB.coral}15` }
  if (inv.status === 'DRAFT')   return { label: '—',       color: BB.inkMute, bg: 'transparent' }
  // SENT
  if (!inv.dueDate) return { label: 'Due', color: BB.teal, bg: `${BB.amber}33` }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(inv.dueDate)
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0)   return { label: 'Overdue',            color: BB.coral,   bg: `${BB.coral}15`  }
  if (diffDays === 0) return { label: 'Due today',           color: '#c07a00',  bg: '#fff8e6'        }
  if (diffDays <= 7)  return { label: `Due in ${diffDays}d`, color: '#c07a00',  bg: '#fff8e6'        }
  return { label: 'Due', color: BB.teal, bg: `${BB.amber}33` }
}

function PaymentStatusBadge({ inv }: { inv: AdminInvoice }) {
  const ps = getPaymentStatus(inv)
  if (ps.label === '—') return <span style={{ color: BB.inkMute, fontSize: 14 }}>—</span>
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: 99,
      background: ps.bg, color: ps.color, fontSize: 11, fontWeight: 700,
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
          color: BB.inkMute, pointerEvents: 'none',
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
                color: p.id === value ? BB.ink : BB.inkSoft,
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
            <span style={{ fontSize: 13, fontWeight: 600, color: BB.inkSoft }}>Billing Period</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {presets.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPreset(p.key)}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 8,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: preset === p.key ? `2px solid ${BB.teal}` : '1.5px solid rgba(28,42,44,0.15)',
                    background: preset === p.key ? BB.ink : '#fff',
                    color: preset === p.key ? '#fff' : BB.inkSoft,
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
                background: 'rgba(244,237,224,0.4)', borderRadius: 8, padding: '8px 12px',
                fontSize: 13, color: BB.inkSoft,
              }}>
                {periodStart} → {periodEnd}
              </div>
            )}
          </div>

          {error && <div style={{ color: '#DC2626', fontSize: 13 }}>{error}</div>}
        </div>
        <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(28,42,44,0.08)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
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
            <div style={{ fontSize: 13, color: BB.inkSoft, marginTop: 2 }}>
              Create draft invoices for all active clients
            </div>
          </div>
          <button onClick={onClose} style={iconBtn}><X size={18} /></button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Period preset */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: BB.inkSoft }}>Billing Period</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['LAST_MONTH', 'THIS_MONTH'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPreset(p)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 8,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: preset === p ? `2px solid ${BB.teal}` : '1.5px solid rgba(28,42,44,0.15)',
                    background: preset === p ? BB.ink : '#fff',
                    color: preset === p ? '#fff' : BB.inkSoft,
                    transition: 'all 0.12s',
                  }}
                >
                  {p === 'LAST_MONTH' ? 'Last Month' : 'This Month'}
                </button>
              ))}
            </div>
            <div style={{
              background: 'rgba(244,237,224,0.4)', borderRadius: 8, padding: '8px 12px',
              fontSize: 13, color: BB.inkSoft,
            }}>
              {range?.start} → {range?.end}
            </div>
          </div>

          {/* Client list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: BB.inkSoft }}>
              Clients ({parents.length})
            </span>
            <div style={{
              border: '1px solid rgba(28,42,44,0.08)', borderRadius: 8,
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
                    <div style={{ fontSize: 14, fontWeight: 600, color: BB.ink }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: BB.inkMute }}>{p.email}</div>
                  </div>
                  <CheckCircle size={14} style={{ color: '#059669', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          padding: '12px 24px', borderTop: '1px solid rgba(28,42,44,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, color: BB.inkSoft }}>
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
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 20, color: BB.ink, letterSpacing: -0.4 }}>
              Invoice OLP-{invoice.id.slice(-6).toUpperCase()}
            </div>
            <div style={{ fontSize: 13, color: BB.inkSoft, marginTop: 3 }}>
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
                  style={{ ...primaryBtn, background: `${BB.coral}15`, color: BB.coral, border: `1px solid ${BB.coral}44` }}>
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
                style={{ ...cancelBtn, background: '#fff8e6', color: '#c07a00', border: '1px solid #ffe08a' }}
              >
                <Bell size={13} /> Send Reminder
              </button>
            )}

            <button onClick={exportSingle} style={{ ...ghostBtn, marginLeft: 'auto' }}>
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
            <div style={{ border: `1px solid rgba(28,42,44,0.08)`, borderRadius: 10, overflow: 'hidden' }}>
              {invoice.items.map((item, i) => (
                <div key={item.id} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '11px 14px',
                  borderTop: i === 0 ? 'none' : '1px solid rgba(28,42,44,0.06)',
                  background: i % 2 === 0 ? '#fff' : 'rgba(244,237,224,0.3)',
                  fontSize: 13,
                }}>
                  <span style={{ color: BB.inkSoft }}>{item.description}</span>
                  <span style={{ fontWeight: 700, color: BB.teal, whiteSpace: 'nowrap', marginLeft: 16, fontFamily: "'Fraunces', serif", fontSize: 14 }}>
                    HKD {item.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(244,237,224,0.5)', borderRadius: 10, border: '1px solid rgba(28,42,44,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: BB.inkSoft, marginBottom: 6 }}>
              <span>Subtotal</span>
              <span>{fmt(editing ? editedTotal : invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: BB.teal, marginBottom: 6 }}>
                <span>Bundle discount</span>
                <span>−{fmt(invoice.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(28,42,44,0.1)', marginTop: 4 }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontStyle: 'italic', color: BB.ink }}>Total</span>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, color: BB.teal, letterSpacing: -0.5 }}>{fmt(editing ? editedTotal : invoice.total)}</span>
            </div>
            {invoice.dueDate && (
              <div style={{ fontSize: 11, color: BB.inkMute, textAlign: 'right', marginTop: 4 }}>Due {invoice.dueDate}</div>
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

  // KPI counts
  const draftCount   = invoices.filter(i => i.status === 'DRAFT').length
  const sentCount    = invoices.filter(i => i.status === 'SENT').length
  const paidCount    = invoices.filter(i => i.status === 'PAID').length
  const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%', background: '#faf9f6' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 300, color: BB.ink, margin: 0, letterSpacing: -0.8, lineHeight: 1 }}>
              Invoices
            </h1>
            {overdueCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: `${BB.coral}15`, color: BB.coral, border: `1px solid ${BB.coral}44` }}>
                {overdueCount} overdue
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: BB.inkSoft }}>
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} · <span style={{ fontWeight: 600, color: BB.teal }}>{fmt(summaryTotal)}</span>
            {outstandingTotal > 0 && <> · <span style={{ color: BB.coral }}>{fmt(outstandingTotal)} outstanding</span></>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {selected.size > 0 && (
            <button onClick={bulkSend} disabled={sendInvoice.isPending} style={primaryBtn}>
              <Send size={14} /> Send {selected.size} draft{selected.size > 1 ? 's' : ''}
            </button>
          )}
          <button onClick={exportAll} style={ghostBtn}><Download size={14} /> Xero CSV</button>
          <button onClick={() => setShowGenerateAll(true)} style={ghostBtn}>
            <Users size={14} /> Generate All
          </button>
          <button onClick={() => setShowGenerate(true)} style={primaryBtn}>
            <Plus size={14} /> New Invoice
          </button>
        </div>
      </div>

      {/* ── KPI chips ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          { label: 'Draft',   count: draftCount,   color: BB.inkSoft, bg: 'rgba(255,255,255,0.9)' },
          { label: 'Sent',    count: sentCount,    color: BB.teal,    bg: `${BB.amber}25` },
          { label: 'Paid',    count: paidCount,    color: BB.teal,    bg: `${BB.teal}12` },
          { label: 'Overdue', count: overdueCount, color: BB.coral,   bg: `${BB.coral}12` },
        ].map(k => (
          <button
            key={k.label}
            onClick={() => setStatusFilter(statusFilter === k.label.toUpperCase() ? '' : k.label.toUpperCase())}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
              borderRadius: 99, border: `1.5px solid ${statusFilter === k.label.toUpperCase() ? k.color : 'rgba(28,42,44,0.12)'}`,
              background: statusFilter === k.label.toUpperCase() ? k.bg : 'rgba(255,255,255,0.8)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700, color: k.color, lineHeight: 1, fontFamily: "'Fraunces', serif" }}>{k.count}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: k.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.label}</span>
          </button>
        ))}

        {/* Month filter */}
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          style={{ ...inputStyle, width: 180, marginLeft: 'auto', borderRadius: 99, paddingLeft: 14 }}
        >
          {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
        </select>
      </div>

      {/* ── Invoice list ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(28,42,44,0.08), 0 0 0 1px rgba(28,42,44,0.06)' }}>

        {/* List header */}
        <div style={{ display: 'grid', gridTemplateColumns: '36px 130px 1fr 160px 100px 120px auto 110px 40px', alignItems: 'center', padding: '10px 16px', background: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(28,42,44,0.08)' }}>
          <div>
            <input type="checkbox"
              checked={selected.size === invoices.length && invoices.length > 0}
              onChange={selectAll} />
          </div>
          {['Invoice', 'Client', 'Period', 'Due date', 'Status', 'Payment', 'Amount', ''].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: BB.inkMute, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: BB.inkMute, background: '#fff' }}>Loading…</div>
        ) : invoices.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${BB.bg}`, border: `2px dashed rgba(28,42,44,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} color={BB.inkMute} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: BB.inkSoft, fontFamily: "'Fraunces', serif" }}>No invoices yet</div>
            <div style={{ fontSize: 13, color: BB.inkMute }}>Generate an invoice to get started</div>
          </div>
        ) : (
          invoices.map((inv, idx) => (
            <div
              key={inv.id}
              onClick={() => setSelectedInv(inv)}
              style={{
                display: 'grid', gridTemplateColumns: '36px 130px 1fr 160px 100px 120px auto 110px 40px',
                alignItems: 'center', padding: '14px 16px',
                background: idx % 2 === 0 ? '#fff' : 'rgba(244,237,224,0.3)',
                borderBottom: '1px solid rgba(28,42,44,0.05)',
                cursor: 'pointer', transition: 'background 0.12s',
                borderLeft: `3px solid ${STATUS_BORDER[inv.status] ?? 'transparent'}`,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = `${BB.amber}18` }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = idx % 2 === 0 ? '#fff' : 'rgba(244,237,224,0.3)' }}
            >
              <div onClick={e => { e.stopPropagation(); toggleSelect(inv.id) }}>
                <input type="checkbox" checked={selected.has(inv.id)}
                  onChange={() => toggleSelect(inv.id)} onClick={e => e.stopPropagation()} />
              </div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, color: BB.ink, fontSize: 14 }}>
                OLP-{inv.id.slice(-6).toUpperCase()}
              </div>
              <div style={{ fontSize: 14, color: BB.ink, fontWeight: 500 }}>{inv.parent.name}</div>
              <div style={{ fontSize: 12, color: BB.inkSoft }}>
                {inv.periodStart} – {inv.periodEnd}
              </div>
              <div style={{ fontSize: 12, color: BB.inkSoft }}>{inv.dueDate ?? '—'}</div>
              <div><StatusBadge status={inv.status} /></div>
              <div><PaymentStatusBadge inv={inv} /></div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 15, color: BB.teal, textAlign: 'right' }}>
                {fmt(inv.total)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                {(inv.status === 'SENT' || inv.status === 'OVERDUE') && (
                  <button
                    onClick={e => { e.stopPropagation(); sendReminder.mutate(inv.id) }}
                    disabled={sendReminder.isPending}
                    style={{ padding: '3px 7px', background: '#fff8e6', color: '#c07a00', border: '1px solid #ffe08a', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}
                  >
                    <Bell size={10} />
                  </button>
                )}
                <ChevronRight size={15} style={{ color: BB.inkMute, flexShrink: 0 }} />
              </div>
            </div>
          ))
        )}
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
  position: 'fixed', inset: 0, background: 'rgba(28,42,44,0.55)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: 20, backdropFilter: 'blur(4px)',
}
const modalBox: React.CSSProperties = {
  background: '#faf9f6', borderRadius: 16,
  boxShadow: '0 24px 64px rgba(28,42,44,0.22)',
  display: 'flex', flexDirection: 'column',
  overflow: 'hidden',
  border: '1px solid rgba(28,42,44,0.08)',
}
const modalHeader: React.CSSProperties = {
  padding: '18px 22px', borderBottom: '1px solid rgba(28,42,44,0.08)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  background: '#fff',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid rgba(28,42,44,0.15)',
  borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff',
  boxSizing: 'border-box', color: BB.ink,
}
const fieldLabel: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 6,
  fontSize: 12, fontWeight: 700, color: BB.inkSoft, textTransform: 'uppercase', letterSpacing: 0.5,
}
const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: BB.inkSoft, display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6,
}
const primaryBtn: React.CSSProperties = {
  padding: '8px 16px', background: BB.teal, color: '#fff',
  border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
  fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
}
const ghostBtn: React.CSSProperties = {
  padding: '8px 14px', background: 'rgba(255,255,255,0.8)', color: BB.inkSoft,
  border: '1px solid rgba(28,42,44,0.15)', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
  fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
}
const cancelBtn: React.CSSProperties = {
  padding: '8px 14px', background: 'rgba(244,237,224,0.7)', color: BB.inkSoft,
  border: '1px solid rgba(28,42,44,0.12)', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
  fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
}
