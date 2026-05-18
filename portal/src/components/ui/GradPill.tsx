import type { ReactNode, CSSProperties } from 'react'

interface GradPillProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'amber' | 'teal' | 'glass' | 'coral'
  style?: CSSProperties
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}

export default function GradPill({
  children, size = 'md', variant = 'amber', style = {}, className = '',
  onClick, type = 'button', disabled,
}: GradPillProps) {
  const h = size === 'sm' ? 32 : size === 'lg' ? 52 : 44
  const bg = variant === 'teal' ? '#4AADBC'
    : variant === 'glass' ? 'rgba(255,255,255,.6)'
    : variant === 'coral' ? '#E8623A'
    : 'linear-gradient(135deg, #F5C842 0%, #E8623A 100%)'
  const color = variant === 'glass' ? '#2D2D2D' : '#fff'
  const shadow = variant === 'glass'
    ? '0 2px 10px rgba(0,0,0,.06), inset 0 0 0 1px rgba(255,255,255,.6)'
    : variant === 'teal' ? '0 6px 18px rgba(74,173,188,.35)'
    : '0 6px 18px rgba(232,98,58,.35)'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 font-bold cursor-pointer border-none ${className}`}
      style={{
        height: h, padding: '0 22px', borderRadius: 9999,
        background: bg, color,
        fontSize: size === 'sm' ? 13 : 15,
        boxShadow: shadow,
        backdropFilter: variant === 'glass' ? 'blur(12px)' : 'none',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  )
}
