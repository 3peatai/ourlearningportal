import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SkeletonGlass, SkeletonCard } from './components/ui/Skeleton'
import { R } from './lib/routes'

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────

const LoginPage = lazy(() => import('./pages/LoginPage'))
const NotFound  = lazy(() => import('./pages/NotFound'))

// Parent
const ParentDashboard = lazy(() => import('./pages/parent/ParentDashboard'))
const ParentSchedule  = lazy(() => import('./pages/parent/ParentSchedule'))
const ParentInvoice   = lazy(() => import('./pages/parent/ParentInvoice'))
const ParentChildren  = lazy(() => import('./pages/parent/ParentChildren'))
const ParentProfile   = lazy(() => import('./pages/parent/ParentProfile'))

// Teacher
const TeacherDashboard    = lazy(() => import('./pages/teacher/TeacherDashboard'))
const TeacherClasses      = lazy(() => import('./pages/teacher/TeacherClasses'))
const TeacherAvailability = lazy(() => import('./pages/teacher/TeacherAvailability'))
const TeacherPayslip      = lazy(() => import('./pages/teacher/TeacherPayslip'))
const TeacherProfile      = lazy(() => import('./pages/teacher/TeacherProfile'))

// Admin
const AdminLayout    = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminStudents  = lazy(() => import('./pages/admin/AdminStudents'))
const AdminCalendar  = lazy(() => import('./pages/admin/AdminCalendar'))
const AdminInvoices  = lazy(() => import('./pages/admin/AdminInvoices'))
const AdminTeachers  = lazy(() => import('./pages/admin/AdminTeachers'))
const AdminExpenses  = lazy(() => import('./pages/admin/AdminExpenses'))
const AdminProgrammes = lazy(() => import('./pages/admin/AdminProgrammes'))

// ─── React Query client ───────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

// ─── Fallback skeletons ───────────────────────────────────────────────────────

function ParentFallback() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SkeletonGlass variant="amber" lines={2} style={{ height: 180 }} />
      <SkeletonGlass variant="amber" lines={3} />
    </div>
  )
}
function TeacherFallback() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <SkeletonGlass variant="teal" lines={2} style={{ height: 120 }} />
      <SkeletonGlass variant="teal" lines={3} />
    </div>
  )
}
function AdminFallback() {
  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SkeletonCard variant="neutral" style={{ height: 60 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} variant="neutral" style={{ height: 120 }} />
        ))}
      </div>
    </div>
  )
}

// ─── Route guards ─────────────────────────────────────────────────────────────

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to={R.LOGIN} replace />
  if (user.role === 'ADMIN')   return <Navigate to={R.ADMIN_DASHBOARD} replace />
  if (user.role === 'TEACHER') return <Navigate to={R.TEACHER_DASHBOARD} replace />
  return <Navigate to={R.PARENT_DASHBOARD} replace />
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute roles={['ADMIN']}>{children}</ProtectedRoute>
}
function ParentGuard({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute roles={['PARENT']}>{children}</ProtectedRoute>
}
function TeacherGuard({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute roles={['TEACHER']}>{children}</ProtectedRoute>
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 600, fontSize: 14, borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  padding: '12px 16px', maxWidth: 360,
                },
                success: {
                  style: { background: '#ECFDF5', color: '#065F46', border: '1px solid #6EE7B7' },
                  iconTheme: { primary: '#059669', secondary: '#ECFDF5' },
                },
                error: {
                  style: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5' },
                  iconTheme: { primary: '#DC2626', secondary: '#FEF2F2' },
                },
              }}
            />

            <Routes>
              {/* Redirect /portal root to login */}
              <Route path="/portal" element={<RootRedirect />} />

              <Route path="/portal/login" element={
                <Suspense fallback={null}><LoginPage /></Suspense>
              } />

              {/* ── Parent ── */}
              <Route path="/portal/parent" element={<Navigate to={R.PARENT_DASHBOARD} replace />} />
              <Route path="/portal/parent/dashboard" element={
                <ParentGuard><Suspense fallback={<ParentFallback />}><ParentDashboard /></Suspense></ParentGuard>
              } />
              <Route path="/portal/parent/schedule" element={
                <ParentGuard><Suspense fallback={<ParentFallback />}><ParentSchedule /></Suspense></ParentGuard>
              } />
              <Route path="/portal/parent/invoice" element={
                <ParentGuard><Suspense fallback={<ParentFallback />}><ParentInvoice /></Suspense></ParentGuard>
              } />
              <Route path="/portal/parent/children" element={
                <ParentGuard><Suspense fallback={<ParentFallback />}><ParentChildren /></Suspense></ParentGuard>
              } />
              <Route path="/portal/parent/profile" element={
                <ParentGuard><Suspense fallback={<ParentFallback />}><ParentProfile /></Suspense></ParentGuard>
              } />

              {/* ── Teacher ── */}
              <Route path="/portal/teacher" element={<Navigate to={R.TEACHER_DASHBOARD} replace />} />
              <Route path="/portal/teacher/dashboard" element={
                <TeacherGuard><Suspense fallback={<TeacherFallback />}><TeacherDashboard /></Suspense></TeacherGuard>
              } />
              <Route path="/portal/teacher/classes" element={
                <TeacherGuard><Suspense fallback={<TeacherFallback />}><TeacherClasses /></Suspense></TeacherGuard>
              } />
              <Route path="/portal/teacher/availability" element={
                <TeacherGuard><Suspense fallback={<TeacherFallback />}><TeacherAvailability /></Suspense></TeacherGuard>
              } />
              <Route path="/portal/teacher/payslip" element={
                <TeacherGuard><Suspense fallback={<TeacherFallback />}><TeacherPayslip /></Suspense></TeacherGuard>
              } />
              <Route path="/portal/teacher/profile" element={
                <TeacherGuard><Suspense fallback={<TeacherFallback />}><TeacherProfile /></Suspense></TeacherGuard>
              } />

              {/* ── Admin (nested layout) ── */}
              <Route path="/portal/admin" element={
                <AdminGuard><Suspense fallback={<AdminFallback />}><AdminLayout /></Suspense></AdminGuard>
              }>
                <Route index element={<Navigate to={R.ADMIN_DASHBOARD} replace />} />
                <Route path="dashboard"  element={<Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>} />
                <Route path="students"   element={<Suspense fallback={<AdminFallback />}><AdminStudents /></Suspense>} />
                <Route path="calendar"   element={<Suspense fallback={<AdminFallback />}><AdminCalendar /></Suspense>} />
                <Route path="invoices"   element={<Suspense fallback={<AdminFallback />}><AdminInvoices /></Suspense>} />
                <Route path="teachers"   element={<Suspense fallback={<AdminFallback />}><AdminTeachers /></Suspense>} />
                <Route path="expenses"   element={<Suspense fallback={<AdminFallback />}><AdminExpenses /></Suspense>} />
                <Route path="programmes" element={<Suspense fallback={<AdminFallback />}><AdminProgrammes /></Suspense>} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<Suspense fallback={null}><NotFound /></Suspense>} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
