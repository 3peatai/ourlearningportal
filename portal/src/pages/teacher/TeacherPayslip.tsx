import { useState } from 'react'
import { useTeacherPayslips, useTeacherPayslip } from '../../hooks/teacher'
import ClassroomBG from '../../components/ui/ClassroomBG'
import Glass from '../../components/ui/Glass'
import GradPill from '../../components/ui/GradPill'
import Icon from '../../components/ui/Icon'
import Pill from '../../components/ui/Pill'
import BottomNav from '../../components/nav/BottomNav'
import { BB } from '../../lib/bb'
import { R } from '../../lib/routes'

const TEACHER_TABS = [
  { key: 'home',  path: R.TEACHER_DASHBOARD,    icon: 'home',     label: 'Home'         },
  { key: 'cls',   path: R.TEACHER_CLASSES,      icon: 'calendar', label: 'Classes'      },
  { key: 'avail', path: R.TEACHER_AVAILABILITY, icon: 'clock',    label: 'Availability' },
  { key: 'pay',   path: R.TEACHER_PAYSLIP,      icon: 'card',     label: 'Payslip'      },
]

export default function TeacherPayslip() {
  const { data: payslips = [] } = useTeacherPayslips()
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)

  const { data: payslip, isLoading } = useTeacherPayslip(selectedId)

  function handlePrint() {
    window.print()
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <ClassroomBG seed={6} />
      <div className="relative flex flex-col min-h-screen">

        {/* ── Header (hidden on print) ── */}
        <div className="no-print px-4 pt-4 pb-2 relative z-10 flex items-center justify-between">
          <div style={{ fontSize: 20, fontWeight: 800, color: BB.ink, letterSpacing: -0.3 }}>Payslip</div>
          <GradPill size="sm" variant="teal" onClick={handlePrint}>
            <Icon name="doc" size={14} /> Download PDF
          </GradPill>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-28 relative z-10">

          {/* Period selector */}
          <div className="no-print" style={{ marginBottom: 14, marginTop: 4 }}>
            <select
              value={selectedId ?? ''}
              onChange={e => setSelectedId(e.target.value || undefined)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,.1)', background: 'rgba(255,255,255,.8)', fontSize: 14, color: BB.ink, appearance: 'none', cursor: 'pointer' }}
            >
              <option value="">Latest payslip</option>
              {payslips.map(p => (
                <option key={p.id} value={p.id}>{p.period} — HKD {Math.round(p.grossAmount).toLocaleString()}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-2 border-[#4AADBC] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !payslip ? (
            <Glass padding={28} style={{ textAlign: 'center', marginTop: 16 }}>
              <div style={{ fontSize: 32 }}>💰</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: BB.ink, marginTop: 10 }}>No payslip yet</div>
              <div style={{ fontSize: 13, color: BB.inkSoft, marginTop: 4 }}>Payslips are generated at end of each month</div>
            </Glass>
          ) : (
            <div className="print-payslip">

              {/* Print header */}
              <div className="print-only" style={{ display: 'none', marginBottom: 24 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: BB.ink }}>Our Learning Portal</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: BB.inkSoft }}>Teacher Payslip</div>
                <div style={{ fontSize: 13, color: BB.inkSoft, marginTop: 4 }}>{payslip.teacherName} · {payslip.speciality}</div>
                <div style={{ fontSize: 13, color: BB.inkSoft }}>{payslip.periodStart} – {payslip.periodEnd}</div>
              </div>

              {/* Period + status */}
              <div className="flex items-center justify-between mb-4 no-print">
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: BB.ink }}>{payslip.period}</div>
                  <div style={{ fontSize: 12, color: BB.inkSoft }}>{payslip.periodStart} – {payslip.periodEnd}</div>
                </div>
                <Pill color={payslip.status === 'CONFIRMED' || payslip.status === 'PAID' ? BB.green : BB.amber}>
                  {payslip.status === 'DRAFT' ? 'Draft' : payslip.status === 'CONFIRMED' ? 'Confirmed' : payslip.status}
                </Pill>
              </div>

              {/* Summary strip */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'SESSIONS', value: payslip.totalSessions },
                  { label: 'HOURS', value: payslip.totalHours },
                  { label: 'HKD', value: `${Math.round(payslip.grossAmount).toLocaleString()}` },
                ].map(item => (
                  <Glass key={item.label} padding={12} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: BB.teal, lineHeight: 1 }}>{item.value}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: BB.inkSoft, marginTop: 4 }}>{item.label}</div>
                  </Glass>
                ))}
              </div>

              {/* Line items */}
              <Glass padding={0} style={{ overflow: 'hidden', marginBottom: 8 }}>
                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '90px 60px 1fr 52px 52px', gap: 0, padding: '10px 14px', background: `${BB.teal}15`, borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                  {['Date', 'Student', 'Programme', 'Dur.', 'HKD'].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 800, color: BB.inkSoft, letterSpacing: 0.3 }}>{h}</div>
                  ))}
                </div>

                {/* Rows */}
                {payslip.items.length === 0 ? (
                  <div style={{ padding: '20px 14px', textAlign: 'center', color: BB.inkMute, fontSize: 13 }}>
                    No sessions in this period.
                  </div>
                ) : (
                  payslip.items.map((item, i) => (
                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '90px 60px 1fr 52px 52px', gap: 0, padding: '10px 14px', borderBottom: i < payslip.items.length - 1 ? '1px solid rgba(0,0,0,.05)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,.015)' }}>
                      <div style={{ fontSize: 12, color: BB.inkSoft }}>{item.date}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: BB.ink }}>{item.studentFirstName}</div>
                      <div style={{ fontSize: 12, color: BB.ink }}>{item.programme}</div>
                      <div style={{ fontSize: 12, color: BB.inkSoft }}>{item.durationMin}m</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: BB.ink }}>{Math.round(item.amount)}</div>
                    </div>
                  ))
                )}

                {/* Total row */}
                {payslip.items.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '90px 60px 1fr 52px 52px', gap: 0, padding: '12px 14px', background: `${BB.teal}12`, borderTop: `2px solid ${BB.teal}33` }}>
                    <div style={{ gridColumn: '1 / 5', fontSize: 13, fontWeight: 800, color: BB.ink }}>Total</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: BB.teal }}>
                      {Math.round(payslip.grossAmount).toLocaleString()}
                    </div>
                  </div>
                )}
              </Glass>

              {/* Rate info */}
              <div style={{ fontSize: 12, color: BB.inkSoft, textAlign: 'center', marginTop: 12 }}>
                Rate: HKD {payslip.ratePerHour}/hr
              </div>

              {/* Note */}
              <div className="no-print" style={{ fontSize: 12, color: BB.inkSoft, textAlign: 'center', marginTop: 10, padding: '10px 16px', borderRadius: 12, background: 'rgba(0,0,0,.04)' }}>
                Payslips are confirmed by admin at end of each month.
              </div>
            </div>
          )}
        </div>

        <BottomNav tabs={TEACHER_TABS} accent={BB.teal} />
      </div>
    </div>
  )
}
