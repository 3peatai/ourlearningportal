import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../context/AuthContext'
import ClassroomBG from '../../components/ui/ClassroomBG'
import Glass from '../../components/ui/Glass'
import Icon from '../../components/ui/Icon'
import Avatar from '../../components/ui/Avatar'
import GradPill from '../../components/ui/GradPill'
import BottomNav from '../../components/nav/BottomNav'
import { BB } from '../../lib/bb'
import { R } from '../../lib/routes'

const TEACHER_TABS = [
  { key: 'home',  path: R.TEACHER_DASHBOARD,    icon: 'home',     label: 'Home'         },
  { key: 'cls',   path: R.TEACHER_CLASSES,      icon: 'calendar', label: 'Classes'      },
  { key: 'avail', path: R.TEACHER_AVAILABILITY, icon: 'clock',    label: 'Availability' },
  { key: 'pay',   path: R.TEACHER_PAYSLIP,      icon: 'card',     label: 'Payslip'      },
]

const pwSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type PwForm = z.infer<typeof pwSchema>

function Field({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: BB.inkSoft, marginBottom: 6 }}>{label}</label>
      <input
        {...props}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(0,0,0,.1)', background: 'rgba(255,255,255,.7)', fontSize: 14, color: BB.ink, outline: 'none', boxSizing: 'border-box' }}
      />
      {error && <p style={{ fontSize: 12, color: BB.coral, marginTop: 4 }}>{error}</p>}
    </div>
  )
}

export default function TeacherProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PwForm>({
    resolver: zodResolver(pwSchema),
  })

  async function onChangePw(_data: PwForm) {
    setPwSuccess('')
    setPwError('')
    try {
      await new Promise(r => setTimeout(r, 600)) // demo: simulate network
      setPwSuccess('Password changed successfully.')
      reset()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to change password'
      setPwError(msg)
    }
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <ClassroomBG seed={13} />
      <div className="relative flex flex-col min-h-screen">

        {/* Header */}
        <div className="px-4 pt-4 pb-2 relative z-10">
          <div style={{ fontSize: 22, fontWeight: 800, color: BB.ink, letterSpacing: -0.4 }}>Profile</div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-28 relative z-10">

          {/* Profile card */}
          <Glass padding={20} accent={`linear-gradient(135deg, ${BB.teal} 0%, #2980b9 100%)`} style={{ marginTop: 8 }}>
            <div className="flex items-center gap-4">
              <Avatar name={user?.name ?? ''} color={BB.teal} size={56} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: BB.ink }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: BB.inkSoft }}>{user?.email}</div>
              </div>
            </div>
          </Glass>

          {/* Static info note */}
          <div style={{ fontSize: 12, color: BB.inkSoft, textAlign: 'center', margin: '16px 0 8px', padding: '10px 16px', borderRadius: 12, background: 'rgba(0,0,0,.04)' }}>
            To update your name, email or speciality, contact{' '}
            <a href="mailto:bev@booksandbrains.org" style={{ color: BB.teal, fontWeight: 700 }}>bev@booksandbrains.org</a>
          </div>

          {/* Change password */}
          <Glass padding={20} style={{ marginTop: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: BB.ink, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="lock" size={16} color={BB.ink} /> Change Password
            </div>
            <form onSubmit={handleSubmit(onChangePw)} className="flex flex-col gap-3">
              <Field label="Current password" type="password" autoComplete="current-password" error={errors.currentPassword?.message} {...register('currentPassword')} />
              <Field label="New password" type="password" autoComplete="new-password" error={errors.newPassword?.message} {...register('newPassword')} />
              <Field label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
              {pwSuccess && <p style={{ fontSize: 13, color: BB.green, fontWeight: 700 }}>{pwSuccess}</p>}
              {pwError && <p style={{ fontSize: 13, color: BB.coral }}>{pwError}</p>}
              <GradPill type="submit" variant="teal" size="md" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Update password'}
              </GradPill>
            </form>
          </Glass>

          {/* Sign out */}
          <button
            onClick={() => { logout(); navigate(R.LOGIN) }}
            className="w-full mt-4 flex items-center justify-center gap-2"
            style={{ height: 48, borderRadius: 14, border: '1px solid rgba(0,0,0,.1)', background: 'rgba(255,255,255,.6)', backdropFilter: 'blur(10px)', fontSize: 14, fontWeight: 700, color: BB.inkSoft, cursor: 'pointer' }}
          >
            <Icon name="logout" size={16} color={BB.inkSoft} /> Sign out
          </button>

        </div>

        <BottomNav tabs={TEACHER_TABS} accent={BB.teal} />
      </div>
    </div>
  )
}
