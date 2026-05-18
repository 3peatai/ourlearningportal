import type { ReactNode, CSSProperties } from 'react'

export default function Pill({ children, color = '#4AADBC', light = true, style = {} }: {
  children: ReactNode; color?: string; light?: boolean; style?: CSSProperties
}) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 22, padding: '0 10px', borderRadius: 9999,
      background: light ? `${color}22` : color,
      color: light ? color : '#fff',
      fontWeight: 700, fontSize: 11, letterSpacing: 0.2, flexShrink: 0,
      ...style,
    }}>
      {children}
    </span>
  )
}
