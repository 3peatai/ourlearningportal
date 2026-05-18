import type { ReactNode, CSSProperties } from 'react'

interface GlassProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  padding?: number | string
  radius?: number
  tint?: number
  accent?: string
  onClick?: () => void
}

export default function Glass({
  children, className = '', style = {},
  padding = 16, radius = 20, tint = 0.55, accent, onClick,
}: GlassProps) {
  return (
    <div
      onClick={onClick}
      className={`relative ${className}`}
      style={{
        background: `rgba(255,255,255,${tint})`,
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.55)',
        borderRadius: radius,
        boxShadow: '0 8px 32px rgba(60,40,10,0.08), 0 1px 0 rgba(255,255,255,0.6) inset',
        padding,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {accent && (
        <div className="absolute left-3 right-3 top-0 h-[3px] rounded-full" style={{ background: accent }} />
      )}
      {children}
    </div>
  )
}
