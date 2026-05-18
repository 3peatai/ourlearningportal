import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParentChildren, type Child } from '../../hooks/parent'
import ClassroomBG from '../../components/ui/ClassroomBG'
import Glass from '../../components/ui/Glass'
import Icon from '../../components/ui/Icon'
import Avatar from '../../components/ui/Avatar'
import Mascot from '../../components/ui/Mascot'
import Pill from '../../components/ui/Pill'
import BottomNav from '../../components/nav/BottomNav'
import { BB } from '../../lib/bb'
import { R } from '../../lib/routes'

const PARENT_TABS = [
  { key: 'home',  path: R.PARENT_DASHBOARD, icon: 'home',     label: 'Home'     },
  { key: 'sched', path: R.PARENT_SCHEDULE,  icon: 'calendar', label: 'Schedule' },
  { key: 'inv',   path: R.PARENT_INVOICE,   icon: 'doc',      label: 'Invoice'  },
  { key: 'prof',  path: R.PARENT_PROFILE,   icon: 'user',     label: 'Profile'  },
]

const PKG_LABEL: Record<string, string> = { MONTHLY: 'Monthly', BUNDLE_12: 'Bundle 12', BUNDLE_24: 'Bundle 24' }
const PKG_COLOR: Record<string, string> = { MONTHLY: BB.teal, BUNDLE_12: BB.amber, BUNDLE_24: BB.coral }

function ChildDetail({ child, onClose }: { child: Child; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="w-full rounded-t-3xl overflow-y-auto" style={{ background: '#FAF9F6', maxHeight: '88vh', padding: '20px 16px 40px' }} onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div className="flex justify-center mb-4">
          <div style={{ width: 36, height: 4, borderRadius: 999, background: 'rgba(0,0,0,.12)' }} />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Avatar name={child.name} color={BB.amber} size={52} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: BB.ink }}>{child.name}</div>
            <div style={{ fontSize: 13, color: BB.inkSoft }}>Age {child.age}</div>
          </div>
        </div>

        {/* Enrollments */}
        <div style={{ fontSize: 13, fontWeight: 800, color: BB.inkSoft, letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>Enrolled Programmes</div>
        <div className="flex flex-col gap-2 mb-6">
          {child.enrollments.map((e, i) => (
            <Glass key={i} padding={12} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Mascot kind={e.mascot} size={36} />
              <div className="flex-1">
                <div style={{ fontSize: 14, fontWeight: 700, color: BB.ink }}>{e.programme}</div>
                <div style={{ fontSize: 12, color: BB.inkSoft }}>{e.category}</div>
              </div>
              <Pill color={PKG_COLOR[e.packageType] ?? BB.teal}>{PKG_LABEL[e.packageType] ?? e.packageType}</Pill>
            </Glass>
          ))}
        </div>

        {/* Upcoming */}
        {child.upcomingSessions.length > 0 && (
          <>
            <div style={{ fontSize: 13, fontWeight: 800, color: BB.inkSoft, letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>Upcoming Classes</div>
            <div className="flex flex-col gap-2 mb-6">
              {child.upcomingSessions.map(s => (
                <Glass key={s.id} padding={12} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Mascot kind={s.mascot} size={32} />
                  <div className="flex-1">
                    <div style={{ fontSize: 13, fontWeight: 700, color: BB.ink }}>{s.programme} · {s.durationMin} min</div>
                    <div style={{ fontSize: 12, color: BB.inkSoft }}>{s.displayDate}</div>
                    <div style={{ fontSize: 12, color: BB.inkSoft }}>{s.teacher}</div>
                  </div>
                </Glass>
              ))}
            </div>
          </>
        )}

        {/* Past sessions */}
        {child.pastSessions.length > 0 && (
          <>
            <div style={{ fontSize: 13, fontWeight: 800, color: BB.inkSoft, letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>Past Classes</div>
            <div className="flex flex-col gap-2">
              {child.pastSessions.map(s => (
                <div key={s.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                  <Mascot kind={s.mascot} size={28} />
                  <div className="flex-1">
                    <div style={{ fontSize: 13, fontWeight: 700, color: BB.ink }}>{s.programme}</div>
                    <div style={{ fontSize: 12, color: BB.inkSoft }}>{s.displayDate} · {s.teacher}</div>
                  </div>
                  <Pill color={s.status === 'COMPLETED' ? BB.green : BB.inkMute}>{s.status === 'COMPLETED' ? '✓' : s.status}</Pill>
                </div>
              ))}
            </div>
          </>
        )}

        {child.upcomingSessions.length === 0 && child.pastSessions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: BB.inkMute, fontSize: 13 }}>No class history yet.</div>
        )}
      </div>
    </div>
  )
}

export default function ParentChildren() {
  const navigate = useNavigate()
  const { data: children = [], isLoading } = useParentChildren()
  const [selected, setSelected] = useState<Child | null>(null)

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <ClassroomBG seed={3} />
      <div className="relative flex flex-col min-h-screen">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2 relative z-10">
          <button onClick={() => navigate(R.PARENT_DASHBOARD)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.65)', border: '1px solid rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', cursor: 'pointer' }}>
            <Icon name="back" size={18} color={BB.ink} />
          </button>
          <div style={{ fontSize: 20, fontWeight: 800, color: BB.ink, letterSpacing: -0.3 }}>My Children</div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-28 relative z-10">
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#F5C842] border-t-transparent rounded-full animate-spin" /></div>
          ) : children.length === 0 ? (
            <Glass padding={24} style={{ textAlign: 'center', marginTop: 20 }}>
              <div style={{ fontSize: 40 }}>👦👧</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: BB.ink, marginTop: 12 }}>No children linked</div>
              <div style={{ fontSize: 13, color: BB.inkSoft }}>Contact admin to link your children.</div>
            </Glass>
          ) : children.map(child => (
            <Glass key={child.id} padding={16} style={{ marginTop: 12, cursor: 'pointer' }} onClick={() => setSelected(child)}>
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={child.name} color={BB.amber} size={48} />
                <div className="flex-1">
                  <div style={{ fontSize: 16, fontWeight: 800, color: BB.ink }}>{child.name}</div>
                  <div style={{ fontSize: 12, color: BB.inkSoft }}>Age {child.age}</div>
                </div>
                <Icon name="chev-r" size={18} color={BB.inkMute} />
              </div>

              {/* Enrolled programmes */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {child.enrollments.map((e, i) => (
                  <Pill key={i} color={e.category === 'LITERACY' ? BB.coral : BB.teal}>{e.programme}</Pill>
                ))}
              </div>

              {/* Package badges */}
              <div className="flex gap-2 mb-3">
                {child.enrollments.map((e, i) => (
                  <Pill key={i} color={PKG_COLOR[e.packageType] ?? BB.teal}>{PKG_LABEL[e.packageType] ?? e.packageType}</Pill>
                ))}
              </div>

              {child.nextClass && (
                <div style={{ fontSize: 12, color: BB.inkSoft, borderTop: '1px solid rgba(0,0,0,.06)', paddingTop: 10 }}>
                  <span style={{ fontWeight: 700 }}>Next: </span>
                  {child.nextClass.displayDate} · {child.nextClass.programme} with {child.nextClass.teacher}
                </div>
              )}
            </Glass>
          ))}
        </div>

        <BottomNav tabs={PARENT_TABS} />
      </div>

      {selected && <ChildDetail child={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
