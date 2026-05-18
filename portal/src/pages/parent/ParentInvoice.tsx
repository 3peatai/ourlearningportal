import { useState } from 'react'
import { useCurrentInvoice, useParentInvoices, useInvoice } from '../../hooks/parent'
import ClassroomBG from '../../components/ui/ClassroomBG'
import Glass from '../../components/ui/Glass'
import Icon from '../../components/ui/Icon'
import BottomNav from '../../components/nav/BottomNav'
import { BB } from '../../lib/bb'
import { R } from '../../lib/routes'

const PARENT_TABS = [
  { key: 'home',  path: R.PARENT_DASHBOARD, icon: 'home',     label: 'Home'     },
  { key: 'sched', path: R.PARENT_SCHEDULE,  icon: 'calendar', label: 'Schedule' },
  { key: 'inv',   path: R.PARENT_INVOICE,   icon: 'doc',      label: 'Invoice'  },
  { key: 'prof',  path: R.PARENT_PROFILE,   icon: 'user',     label: 'Profile'  },
]

const STATUS_COLOR: Record<string, string> = {
  DRAFT: BB.inkMute, SENT: BB.coral, PAID: BB.green, OVERDUE: '#C0392B',
}
const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft', SENT: 'Outstanding', PAID: 'Paid', OVERDUE: 'Overdue',
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLOR[status] ?? BB.inkMute
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 9999, background: `${c}22`, color: c, fontWeight: 700, fontSize: 11 }}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

function PayAccordion() {
  const [open, setOpen] = useState(false)
  return (
    <Glass padding={16} style={{ marginTop: 12 }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between border-none bg-transparent cursor-pointer p-0">
        <div style={{ fontSize: 14, fontWeight: 700, color: BB.ink }}>How to Pay</div>
        <Icon name={open ? 'chev-d' : 'chev-r'} size={18} color={BB.inkMute} />
      </button>
      {open && (
        <div style={{ marginTop: 12, fontSize: 13, color: BB.inkSoft, lineHeight: 1.6 }}>
          <p>Please transfer to:</p>
          <p style={{ fontWeight: 700, color: BB.ink, marginTop: 4 }}>[Bank details placeholder]</p>
          <p style={{ marginTop: 8 }}>Use your child's name as reference.</p>
          <p style={{ marginTop: 8 }}>
            Contact{' '}
            <a href="mailto:bev@booksandbrains.org" style={{ color: BB.coral, fontWeight: 700 }}>
              bev@booksandbrains.org
            </a>{' '}
            to confirm payment.
          </p>
        </div>
      )}
    </Glass>
  )
}

function InvoiceModal({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: inv, isLoading } = useInvoice(id)
  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="w-full rounded-t-3xl overflow-y-auto" style={{ background: '#FAF9F6', maxHeight: '85vh', padding: '20px 16px 40px' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div style={{ fontSize: 17, fontWeight: 800, color: BB.ink }}>{inv?.month ?? '—'}</div>
          <button onClick={onClose} style={{ background: 'rgba(0,0,0,.07)', border: 'none', borderRadius: 999, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chev-d" size={16} color={BB.ink} />
          </button>
        </div>
        {isLoading ? <div className="text-center py-8 text-sm text-gray-400">Loading…</div> : inv && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <StatusBadge status={inv.status} />
              <span style={{ fontSize: 22, fontWeight: 900, color: BB.ink }}>HKD {inv.total.toLocaleString()}</span>
            </div>
            {inv.items?.map(item => (
              <div key={item.id} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(0,0,0,.05)', fontSize: 13 }}>
                <span style={{ color: BB.ink, flex: 1, paddingRight: 8 }}>{item.description}</span>
                <span style={{ fontWeight: 700, color: item.amount < 0 ? BB.green : BB.ink, flexShrink: 0 }}>
                  {item.amount < 0 ? '−' : ''}HKD {Math.abs(item.amount).toLocaleString()}
                </span>
              </div>
            ))}
            <PayAccordion />
          </>
        )}
      </div>
    </div>
  )
}

export default function ParentInvoice() {
  const { data: current, isLoading: curLoading } = useCurrentInvoice()
  const { data: invoices = [], isLoading: listLoading } = useParentInvoices()
  const [modalId, setModalId] = useState<string | null>(null)

  const history = invoices.filter(inv => inv.id !== current?.id)

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <ClassroomBG seed={7} />
      <div className="relative flex flex-col min-h-screen">

        {/* Header */}
        <div className="px-4 pt-4 pb-2 relative z-10">
          <div style={{ fontSize: 22, fontWeight: 800, color: BB.ink, letterSpacing: -0.4 }}>Invoice</div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-28 relative z-10">

          {/* Current invoice */}
          {curLoading ? (
            <div className="flex justify-center py-8"><div className="w-7 h-7 border-2 border-[#F5C842] border-t-transparent rounded-full animate-spin" /></div>
          ) : !current ? (
            <Glass padding={20} style={{ textAlign: 'center', marginTop: 12 }}>
              <div style={{ fontSize: 32 }}>🧾</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: BB.ink, marginTop: 8 }}>No invoice yet</div>
            </Glass>
          ) : (
            <Glass padding={20} accent="linear-gradient(135deg, #F5C842 0%, #E8623A 100%)" style={{ marginTop: 8 }}>
              <div className="flex items-center justify-between mb-2">
                <div style={{ fontSize: 14, fontWeight: 700, color: BB.inkSoft }}>{current.month}</div>
                <StatusBadge status={current.status} />
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: BB.ink, letterSpacing: -1 }}>
                HKD {current.total.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: BB.inkSoft, marginTop: 4 }}>Due {current.dueDate}</div>

              {/* Line items */}
              <div style={{ marginTop: 16, borderTop: '1px solid rgba(0,0,0,.08)', paddingTop: 12 }}>
                {current.items?.map(item => (
                  <div key={item.id} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(0,0,0,.05)', fontSize: 13 }}>
                    <span style={{ color: BB.ink, flex: 1, paddingRight: 8 }}>{item.description}</span>
                    <span style={{ fontWeight: 700, color: item.amount < 0 ? BB.green : BB.ink, flexShrink: 0 }}>
                      {item.amount < 0 ? '−' : ''}HKD {Math.abs(item.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-3" style={{ fontSize: 15, fontWeight: 800, color: BB.ink }}>
                  <span>Total</span>
                  <span>HKD {current.total.toLocaleString()}</span>
                </div>
              </div>
            </Glass>
          )}

          <PayAccordion />

          {/* Invoice history */}
          {history.length > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 800, color: BB.inkSoft, letterSpacing: 0.5, marginTop: 24, marginBottom: 10, textTransform: 'uppercase' }}>
                History
              </div>
              {listLoading ? (
                <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-[#F5C842] border-t-transparent rounded-full animate-spin" /></div>
              ) : history.map(inv => (
                <Glass key={inv.id} padding={14} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setModalId(inv.id)}>
                  <div className="flex-1">
                    <div style={{ fontSize: 14, fontWeight: 700, color: BB.ink }}>{inv.month}</div>
                    <div style={{ fontSize: 12, color: BB.inkSoft }}>{inv.paidAt ? `Paid ${inv.paidAt}` : `Due ${inv.dueDate}`}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={inv.status} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: BB.ink }}>HKD {inv.total.toLocaleString()}</span>
                    <Icon name="chev-r" size={16} color={BB.inkMute} />
                  </div>
                </Glass>
              ))}
            </>
          )}
        </div>

        <BottomNav tabs={PARENT_TABS} />
      </div>

      {modalId && <InvoiceModal id={modalId} onClose={() => setModalId(null)} />}
    </div>
  )
}
