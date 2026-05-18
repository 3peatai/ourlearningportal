/**
 * Skeleton / shimmer components.
 * variant: 'amber' (parent), 'teal' (teacher), 'neutral' (admin)
 */

type Variant = 'amber' | 'teal' | 'neutral'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
  style?: React.CSSProperties
  variant?: Variant
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
  variant = 'neutral',
}: SkeletonProps) {
  return (
    <div
      className={`skeleton-${variant}`}
      style={{ width, height, borderRadius, flexShrink: 0, ...style }}
    />
  )
}

// ─── Pre-shaped composites ────────────────────────────────────────────────────

/** A card-shaped skeleton block */
export function SkeletonCard({ variant = 'neutral', children, style }: {
  variant?: Variant
  children?: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      padding: '20px 22px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      display: 'flex', flexDirection: 'column', gap: 12,
      ...style,
    }}>
      {children ?? (
        <>
          <Skeleton variant={variant} height={20} width="60%" />
          <Skeleton variant={variant} height={14} width="80%" />
          <Skeleton variant={variant} height={14} width="45%" />
        </>
      )}
    </div>
  )
}

/** Skeleton for a stat card row (4 across) */
export function SkeletonStatCards({ variant = 'neutral' }: { variant?: Variant }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} variant={variant}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant={variant} width={44} height={44} borderRadius={12} />
            <Skeleton variant={variant} width={60} height={20} borderRadius={99} />
          </div>
          <Skeleton variant={variant} height={36} width="70%" />
          <Skeleton variant={variant} height={14} width="50%" />
        </SkeletonCard>
      ))}
    </div>
  )
}

/** Skeleton table rows */
export function SkeletonTable({ rows = 6, cols = 5, variant = 'neutral' }: {
  rows?: number
  cols?: number
  variant?: Variant
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      {/* thead placeholder */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #F3F4F6', display: 'flex', gap: 16 }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant={variant} height={12} width={`${60 + (i % 3) * 20}px`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{
          padding: '12px 14px', borderTop: '1px solid #F9FAFB',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} variant={variant} height={14}
              width={c === 0 ? '28px' : c === cols - 1 ? '24px' : `${70 + ((r + c) % 4) * 15}px`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Glass-style skeleton for parent/teacher cards */
export function SkeletonGlass({ variant = 'amber', lines = 3, style }: {
  variant?: Variant
  lines?: number
  style?: React.CSSProperties
}) {
  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      background: 'rgba(255,255,255,.72)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,.6)',
      padding: '20px 18px',
      display: 'flex', flexDirection: 'column', gap: 12,
      ...style,
    }}>
      <Skeleton variant={variant} height={24} width="55%" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} variant={variant} height={14} width={`${75 - i * 15}%`} />
      ))}
    </div>
  )
}

/** Hero card skeleton (next class) */
export function SkeletonHero({ variant = 'amber' }: { variant?: Variant }) {
  return (
    <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,.08)' }}>
      <Skeleton variant={variant} height={48} borderRadius={0} />
      <div style={{
        background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(20px)',
        padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Skeleton variant={variant} width={76} height={76} borderRadius={16} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Skeleton variant={variant} height={22} width="70%" />
            <Skeleton variant={variant} height={14} width="50%" />
          </div>
        </div>
        <Skeleton variant={variant} height={42} borderRadius={12} />
        <Skeleton variant={variant} height={42} borderRadius={12} />
      </div>
    </div>
  )
}
