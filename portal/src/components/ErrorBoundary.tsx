import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message ?? 'Unknown error' }
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', err, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#FAF9F6', padding: 24,
      }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '40px 32px', maxWidth: 440, width: '100%',
          boxShadow: '0 8px 40px rgba(0,0,0,0.10)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>😅</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A2E', marginBottom: 8 }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 1.6 }}>
            An unexpected error occurred. Please refresh the page or contact support if the problem persists.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 28px', background: '#1A1A2E', color: '#fff',
              border: 'none', borderRadius: 12, cursor: 'pointer',
              fontWeight: 700, fontSize: 15,
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }
}

/** Inline per-component error card */
export function InlineError({
  icon,
  message,
  onRetry,
}: {
  icon?: ReactNode
  message?: string
  onRetry?: () => void
}) {
  return (
    <div style={{
      background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12,
      padding: '20px 24px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 10, textAlign: 'center',
    }}>
      {icon && <div style={{ fontSize: 28 }}>{icon}</div>}
      <div style={{ fontSize: 14, fontWeight: 600, color: '#DC2626' }}>
        {message ?? 'Failed to load data'}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '8px 20px', background: '#DC2626', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            fontWeight: 600, fontSize: 13,
          }}
        >
          Try again
        </button>
      )}
    </div>
  )
}
