import { useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { useParentDashboard } from '../../hooks/parent'
import ClassroomBG from '../../components/ui/ClassroomBG'
import Glass from '../../components/ui/Glass'
import GradPill from '../../components/ui/GradPill'
import Icon from '../../components/ui/Icon'
import Avatar from '../../components/ui/Avatar'
import Mascot from '../../components/ui/Mascot'
import Pill from '../../components/ui/Pill'
import BottomNav from '../../components/nav/BottomNav'
import { SkeletonHero } from '../../components/ui/Skeleton'
import { BB } from '../../lib/bb'
import { R } from '../../lib/routes'

const PARENT_TABS = [
  { key: 'home',  path: R.PARENT_DASHBOARD, icon: 'home',     label: 'Home'     },
  { key: 'sched', path: R.PARENT_SCHEDULE,  icon: 'calendar', label: 'Schedule' },
  { key: 'inv',   path: R.PARENT_INVOICE,   icon: 'doc',      label: 'Invoice'  },
  { key: 'prof',  path: R.PARENT_PROFILE,   icon: 'user',     label: 'Profile'  },
]

interface SlotItem {
  id: string; dateLabel: string; timeLabel: string; teacherName: string; teacherColor: string;
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
  const altTeacher = primaryColor === BB.amber
    ? { name: 'Gwen Torres', color: '#06D6A0' }
    : { name: 'Beverly Wong', color: BB.amber }
  return SLOT_OFFSETS.map((s, i) => {
    const d = new Date(); d.setDate(d.getDate() + s.offset)
    const teacher = s.primary ? { name: primaryTeacher, color: primaryColor } : altTeacher
    return { id: `slot-${i}`, dateLabel: d.toLocaleDateString('en-HK', { weekday: 'short', day: 'numeric', month: 'short' }), timeLabel: fmtHour(s.hour), teacherName: teacher.name, teacherColor: teacher.color }
  })
}

function SlotPickerSheet({ title, subtitle, programme, mascot, primaryTeacher, primaryColor, onClose, onConfirm }: {
  title: string; subtitle: string; programme: string; mascot: string
  primaryTeacher: string; primaryColor: string
  onClose: () => void; onConfirm: (slot: SlotItem) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const slots = useMemo(() => generateSlots(primaryTeacher, primaryColor), [primaryTeacher, primaryColor])
  const selectedSlot = slots.find(s => s.id === selected)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,.48)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 560, margin: '0 auto', background: '#fff', borderRadius: '24px 24px 0 0', maxHeight: '88dvh', display: 'flex', flexDirection: 'column', boxShadow: '0 -8px 40px rgba(0,0,0,.18)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: '#E5E7EB' }} />
        </div>
        <div style={{ padding: '12px 20px 14px', borderBottom: '1px solid #F3F0EB', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, background: `${primaryColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            <Mascot kind={mascot} size={30} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: BB.ink, letterSpacing: -0.3 }}>{title}</div>
            <div style={{ fontSize: 12, color: BB.inkSoft, marginTop: 1 }}>{subtitle} · {programme}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 99, background: '#F3F0EB', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: BB.inkSoft }}>✕</button>
        </div>
        <div style={{ padding: '14px 20px 6px' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: BB.inkMute, letterSpacing: 0.8, textTransform: 'uppercase' }}>Available in the next 30 days</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {slots.map(slot => {
            const isSel = selected === slot.id
            return (
              <button key={slot.id} onClick={() => setSelected(id => id === slot.id ? null : slot.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderRadius: 16, border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%', background: isSel ? `${slot.teacherColor}15` : '#F9F8F6', outline: isSel ? `2px solid ${slot.teacherColor}` : '2px solid transparent', transition: 'all .15s' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: slot.teacherColor, flexShrink: 0, boxShadow: `0 0 0 3px ${slot.teacherColor}30` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: BB.ink }}>{slot.dateLabel}</div>
                  <div style={{ fontSize: 12, color: BB.inkSoft, marginTop: 1 }}>{slot.teacherName}</div>
                </div>
                <div style={{ padding: '7px 16px', borderRadius: 999, background: isSel ? slot.teacherColor : '#fff', color: isSel ? '#fff' : BB.ink, fontSize: 14, fontWeight: 800, boxShadow: isSel ? `0 4px 12px ${slot.teacherColor}55` : '0 1px 4px rgba(0,0,0,.10)', transition: 'all .15s', flexShrink: 0 }}>{slot.timeLabel}</div>
              </button>
            )
          })}
        </div>
        <div style={{ padding: '12px 20px 32px', borderTop: '1px solid #F3F0EB' }}>
          <GradPill size="md" style={{ width: '100%', justifyContent: 'center', opacity: selected ? 1 : 0.45, pointerEvents: selected ? 'auto' : 'none' }} onClick={() => selectedSlot && onConfirm(selectedSlot)}>
            {selected ? `Confirm · ${selectedSlot?.dateLabel} · ${selectedSlot?.timeLabel}` : 'Select a time above'}
          </GradPill>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const ROLE_MODES = [
  { label: 'Parent',  role: 'PARENT',  email: 'sarah.lam@hkmail.com',         pass: 'parent123',  path: R.PARENT_DASHBOARD  },
  { label: 'Teacher', role: 'TEACHER', email: 'beverly@ourlearningportal.com', pass: 'teacher123', path: R.TEACHER_DASHBOARD },
  { label: 'Admin',   role: 'ADMIN',   email: 'admin@ourlearningportal.com',   pass: 'admin123',   path: R.ADMIN_DASHBOARD   },
]

export default function ParentDashboard() {
  const { user, logout, login } = useAuth()
  const navigate = useNavigate()
  const { data, isLoading } = useParentDashboard()
  const [showReschedule, setShowReschedule] = useState(false)
  useEffect(() => { document.title = 'Home — Our Learning Portal' }, [])

  const nc = data?.nextClass
  const inv = data?.invoiceSummary
  const showInvBanner = inv && (inv.status === 'SENT' || inv.status === 'OVERDUE')
  const lessons = data?.lessonsInfo ?? []
  const greeting = new Date().getHours() < 12 ? 'morning' : 'afternoon'

  function handleRescheduleConfirm(slot: SlotItem) {
    setShowReschedule(false)
    toast.success(`Rescheduled to ${slot.dateLabel} · ${slot.timeLabel} ✓`)
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <ClassroomBG seed={5} />
      <div className="relative flex flex-col min-h-screen">

        {/* ── Mode switcher ── */}
        <div style={{ display: 'flex', gap: 6, padding: '8px 16px 0', position: 'relative', zIndex: 10 }}>
          {ROLE_MODES.map(m => {
            const active = user?.role === m.role
            return (
              <button
                key={m.role}
                disabled={active}
                onClick={async () => { try { await login(m.email, m.pass); navigate(m.path) } catch {} }}
                style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 99,
                  border: `1.5px solid ${active ? BB.teal : 'rgba(28,42,44,0.18)'}`,
                  background: active ? BB.teal : 'rgba(255,255,255,0.72)',
                  color: active ? '#fff' : BB.inkSoft,
                  cursor: active ? 'default' : 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'all .15s',
                }}
              >
                {active ? `✓ ${m.label}` : m.label}
              </button>
            )
          })}
          <span style={{ fontSize: 10, color: BB.inkMute, alignSelf: 'center', marginLeft: 4 }}>demo mode</span>
        </div>

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 relative z-10">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke={BB.teal} strokeWidth="1.6"/>
              <circle cx="14" cy="14" r="6" fill={BB.teal}/>
              <circle cx="22" cy="14" r="1.6" fill={BB.teal}/>
            </svg>
            <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: -0.3, color: BB.ink }}>Our Learning</span>
            <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 17, color: BB.teal }}>portal</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center relative" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.65)', border: '1px solid rgba(255,255,255,.6)', backdropFilter: 'blur(10px)' }}>
              <Icon name="bell" size={18} color={BB.ink} />
              <div className="absolute" style={{ top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: BB.coral, border: '2px solid #fff' }} />
            </div>
            <button onClick={() => { logout(); navigate(R.LOGIN) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Avatar name={user?.name ?? ''} color={BB.coral} size={36} />
            </button>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-4 pb-28 relative z-10">
          <div style={{ fontSize: 22, fontWeight: 800, color: BB.ink, letterSpacing: -0.4, marginTop: 6, marginBottom: 14 }}>
            Good {greeting}, {user?.name?.split(' ')[0]} 👋
          </div>

          {/* ── Hero: Next Class ── */}
          {isLoading ? <SkeletonHero variant="amber" /> : nc ? (
            <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: `0 12px 40px ${BB.coral}38` }}>
              <div style={{ background: `linear-gradient(135deg, ${BB.amber} 0%, ${BB.coral} 100%)`, padding: '10px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.9)', letterSpacing: 1.2, textTransform: 'uppercase' }}>Next Class</div>
                <Pill color="rgba(255,255,255,.25)" style={{ color: '#fff', fontSize: 11 }}>
                  <Icon name="clock" size={10} color="#fff" /> {nc.durationMin} min
                </Pill>
              </div>
              <div style={{ background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(20px)', padding: '18px 18px 16px' }}>
                <div className="flex items-center gap-4 mb-4">
                  <Mascot kind={nc.mascot} size={76} />
                  <div className="flex-1 min-w-0">
                    <div style={{ marginBottom: 6 }}><Pill color={BB.coral}>{nc.category}</Pill></div>
                    <div style={{ fontSize: 21, fontWeight: 900, color: BB.ink, lineHeight: 1.15, letterSpacing: -0.3 }}>{nc.programme}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: BB.inkSoft, marginTop: 3 }}>{nc.studentName} · {nc.teacherName}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 14, background: 'rgba(0,0,0,.05)', marginBottom: 14 }}>
                  <Icon name="calendar" size={16} color={BB.coral} />
                  <div style={{ fontSize: 15, fontWeight: 800, color: BB.ink, flex: 1 }}>{nc.displayTime}</div>
                </div>
                <GradPill size="md" variant="glass" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowReschedule(true)}>
                  <Icon name="calendar" size={16} /> Reschedule
                </GradPill>
              </div>
            </div>
          ) : (
            <Glass padding={24} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36 }}>📅</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: BB.ink, marginTop: 10 }}>No upcoming classes</div>
              <div style={{ fontSize: 13, color: BB.inkSoft, marginTop: 4 }}>Tap below to book your first class</div>
            </Glass>
          )}

          {/* ── Book a Class ── */}
          <Glass padding={18} style={{ marginTop: 14 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: BB.ink, letterSpacing: -0.2 }}>Book a Class</div>
                <div style={{ fontSize: 12, color: BB.inkSoft, marginTop: 1 }}>Lessons remaining in package</div>
              </div>
              <GradPill size="sm" onClick={() => navigate(R.PARENT_SCHEDULE)}>Book <Icon name="arrow" size={14} /></GradPill>
            </div>
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="skeleton-amber" style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <div className="skeleton-amber" style={{ height: 13, width: '60%', borderRadius: 6 }} />
                      <div className="skeleton-amber" style={{ height: 10, width: '35%', borderRadius: 6 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : lessons.length === 0 ? (
              <div style={{ fontSize: 13, color: BB.inkMute, textAlign: 'center', padding: '8px 0' }}>No active enrolments.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {lessons.map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Mascot kind={l.mascot} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: BB.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.programme}</div>
                      <div style={{ fontSize: 11, color: BB.inkSoft }}>{l.studentName}</div>
                    </div>
                    {l.remaining !== null ? (
                      <div style={{ textAlign: 'right', minWidth: 52 }}>
                        <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, color: l.remaining <= 3 ? BB.coral : BB.teal }}>{l.remaining}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: BB.inkMute, letterSpacing: 0.3 }}>OF {l.total} LEFT</div>
                        <div style={{ marginTop: 3, height: 4, width: 52, borderRadius: 999, background: 'rgba(0,0,0,.08)' }}>
                          <div style={{ height: '100%', borderRadius: 999, background: l.remaining <= 3 ? BB.coral : BB.teal, width: `${Math.round((l.remaining / (l.total ?? 1)) * 100)}%` }} />
                        </div>
                      </div>
                    ) : (
                      <Pill color={BB.teal}>Monthly</Pill>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Glass>

          {/* ── Invoice banner ── */}
          {showInvBanner && (
            <Glass padding={14} style={{ marginTop: 12, cursor: 'pointer', background: `linear-gradient(135deg, ${BB.coral}1a, ${BB.amber}12)`, border: `1px solid ${BB.coral}4d`, display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => navigate(R.PARENT_INVOICE)}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `${BB.coral}2e`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="doc" size={18} color={BB.coral} />
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 13, fontWeight: 700, color: BB.ink }}>Invoice due {inv!.dueDate}</div>
                <div style={{ fontSize: 12, color: BB.inkSoft }}>HKD {inv!.total.toLocaleString()}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: BB.coral, display: 'flex', alignItems: 'center', gap: 4 }}>View <Icon name="chev-r" size={14} /></div>
            </Glass>
          )}

          {/* ── Class History ── */}
          <Glass padding={14} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate(R.PARENT_CHILDREN)}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${BB.purple}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="clock" size={20} color={BB.purple} />
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 14, fontWeight: 700, color: BB.ink }}>Class History</div>
              <div style={{ fontSize: 12, color: BB.inkSoft }}>View all past &amp; upcoming classes</div>
            </div>
            <Icon name="chev-r" size={18} color={BB.inkMute} />
          </Glass>
        </div>

        <BottomNav tabs={PARENT_TABS} accent={BB.teal} />
      </div>

      {showReschedule && nc && (
        <SlotPickerSheet title="Reschedule Class" subtitle={nc.teacherName} programme={nc.programme} mascot={nc.mascot} primaryTeacher={nc.teacherName} primaryColor={nc.teacherColor} onClose={() => setShowReschedule(false)} onConfirm={handleRescheduleConfirm} />
      )}
    </div>
  )
}
