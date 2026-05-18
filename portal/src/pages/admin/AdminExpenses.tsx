import { useState, useMemo, useEffect } from 'react'
import {
  BarChart, Bar, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Download, TrendingUp, DollarSign, Clock, Users } from 'lucide-react'
import { useAdminExpenses } from '../../hooks/admin'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) { return `HKD ${Math.round(n).toLocaleString()}` }

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

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number; name?: string; color?: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: '1px solid #F3F4F6', borderRadius: 10,
      padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 13 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, color: p.color ?? '#374151' }}>
          {p.name ? `${p.name}: ` : ''}{fmt(p.value)}
        </div>
      ))}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '20px 22px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280', marginBottom: 8 }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#1A1A2E' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminExpenses() {
  const months = useMemo(() => monthOptions(), [])
  const [selectedMonth, setSelectedMonth] = useState(months[0].val)

  const { data, isLoading } = useAdminExpenses(selectedMonth)
  useEffect(() => { document.title = 'Expenses — Our Learning Portal' }, [])

  function exportCsv() {
    if (!data) return
    const rows = ['Teacher,Sessions,Hours,Rate/hr,Total Cost']
    for (const t of data.byTeacher) {
      rows.push(`"${t.name}",${t.sessions},${t.hours},${t.ratePerHour},${t.cost}`)
    }
    rows.push(`"TOTAL",${data.byTeacher.reduce((s, t) => s + t.sessions, 0)},${data.byTeacher.reduce((s, t) => s + t.hours, 0).toFixed(1)},,${data.totalCost}`)
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `expenses-${selectedMonth}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const totalHours    = data?.byTeacher.reduce((s, t) => s + t.hours, 0) ?? 0
  const totalSessions = data?.byTeacher.reduce((s, t) => s + t.sessions, 0) ?? 0

  // Previous month cost for trend indicator
  const trend = data?.trend ?? []
  const prevCost = trend.length >= 2 ? trend[trend.length - 2]?.cost ?? 0 : 0
  const currCost = data?.totalCost ?? 0
  const trendPct = prevCost > 0 ? ((currCost - prevCost) / prevCost * 100).toFixed(1) : null

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E', margin: 0 }}>Expenses</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Teacher payroll costs</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 }}
          >
            {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
          </select>
          <button onClick={exportCsv} style={cancelBtn}><Download size={14} /> Export CSV</button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 60 }}>Loading…</div>
      ) : !data ? null : (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            <StatCard
              icon={<DollarSign size={16} />}
              label="Total Cost"
              value={fmt(data.totalCost)}
              sub={trendPct
                ? `${Number(trendPct) > 0 ? '+' : ''}${trendPct}% vs last month`
                : undefined}
            />
            <StatCard
              icon={<Clock size={16} />}
              label="Total Hours"
              value={`${totalHours.toFixed(1)}h`}
              sub="Completed sessions"
            />
            <StatCard
              icon={<Users size={16} />}
              label="Sessions"
              value={String(totalSessions)}
              sub="Completed this month"
            />
            <StatCard
              icon={<TrendingUp size={16} />}
              label="Avg Cost/Session"
              value={totalSessions > 0 ? fmt(data.totalCost / totalSessions) : '—'}
            />
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Bar chart — by teacher */}
            <div style={{
              background: '#fff', borderRadius: 14, padding: '20px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A2E', marginBottom: 16 }}>
                Cost by Teacher
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.byTeacher} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }}
                    tickFormatter={n => n.split(' ').slice(-1)[0]} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="cost" name="Cost" radius={[6, 6, 0, 0]}>
                    {data.byTeacher.map((t, i) => (
                      <Cell key={i} fill={t.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line chart — 6-month trend */}
            <div style={{
              background: '#fff', borderRadius: 14, padding: '20px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A2E', marginBottom: 16 }}>
                6-Month Trend
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  <Line
                    type="monotone" dataKey="cost" name="Total Cost"
                    stroke="#4AADBC" strokeWidth={2.5}
                    dot={{ fill: '#4AADBC', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Teacher cost cards */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A2E', marginBottom: 14 }}>
              Breakdown by Teacher
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {data.byTeacher.length === 0 ? (
                <div style={{ color: '#9CA3AF', fontSize: 14 }}>No completed sessions this month</div>
              ) : data.byTeacher.map(t => (
                <div key={t.id} style={{
                  background: '#fff', borderRadius: 12, padding: '16px 18px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  borderLeft: `4px solid ${t.color}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1A1A2E', fontSize: 15 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                        {fmt(t.ratePerHour)}/hr
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#1A1A2E' }}>
                      {fmt(t.cost)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 13, color: '#6B7280' }}>
                    <span>{t.sessions} session{t.sessions !== 1 ? 's' : ''}</span>
                    <span>{t.hours}h taught</span>
                    <span>
                      <span style={{ color: '#1A1A2E', fontWeight: 600 }}>
                        {data.totalCost > 0 ? `${Math.round(t.cost / data.totalCost * 100)}%` : '—'}
                      </span> of total
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  <div style={{ marginTop: 10, height: 4, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99, background: t.color,
                      width: `${data.totalCost > 0 ? (t.cost / data.totalCost * 100) : 0}%`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const cancelBtn: React.CSSProperties = {
  padding: '7px 14px', background: '#F3F4F6', color: '#374151',
  border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
  fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
}
