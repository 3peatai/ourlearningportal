import { Navigate } from 'react-router-dom'
import type { Role } from '../lib/shared'
import { useAuth } from '../context/AuthContext'
import { R } from '../lib/routes'

interface Props {
  children: React.ReactNode
  roles?: Role[]
}

export function ProtectedRoute({ children, roles }: Props) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4ede0' }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0c7872', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!user) return <Navigate to={R.LOGIN} replace />
  if (roles && !roles.includes(user.role)) {
    const home =
      user.role === 'ADMIN'   ? R.ADMIN_DASHBOARD :
      user.role === 'TEACHER' ? R.TEACHER_DASHBOARD :
                                R.PARENT_DASHBOARD
    return <Navigate to={home} replace />
  }

  return <>{children}</>
}
