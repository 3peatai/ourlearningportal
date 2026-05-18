import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  sleep,
  getMockStats,
  getMockActivity,
  getMockTodaySessions,
  getMockCalendarSessions,
  getMockAdminTeacherDetail,
  getMockInvoices,
  getMockExpenses,
  MOCK_TEACHERS,
  MOCK_PROGRAMMES,
  MOCK_PARENTS,
  MOCK_STUDENTS,
  addDays,
  toDateStr,
} from '../lib/mock/data'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  activeStudents: number
  classesToday: number
  outstandingInvoices: { count: number; total: number }
  monthlyTeacherCost: number
}

export interface ActivityEvent {
  id: string
  type: 'class_booked' | 'invoice_sent' | 'invoice_paid' | 'invoice_overdue' | 'student_enrolled' | 'reschedule'
  description: string
  timestamp: string
}

export interface AdminEnrollment {
  id: string
  programme: { id: string; name: string; slug: string; color: string; mascot: string }
  packageType: string
  startDate: string
  bundleTotal: number | null
  used: number
  remaining: number | null
}

export interface AdminStudent {
  id: string
  name: string
  dateOfBirth: string
  age: number
  notes: string | null
  archived: boolean
  archivedAt: string | null
  parent: { id: string; name: string; email: string; phone: string | null }
  enrollments: AdminEnrollment[]
  upcomingTeacher: { id: string; name: string } | null
}

export interface AdminStudentDetail extends AdminStudent {
  upcomingSessions: {
    id: string
    dateStr: string
    displayDateTime: string
    programme: string
    teacher: string
    durationMin: number
  }[]
}

export interface CalendarSession {
  id: string
  dateStr: string
  displayDate: string
  displayTime: string
  startTimeISO: string
  hktHour: number
  hktMin: number
  durationMin: number
  status: string
  isMakeup: boolean
  notes: string | null
  student: { id: string; name: string }
  teacher: { id: string; name: string; color: string }
  programme: { id: string; name: string; slug: string; color: string }
}

export interface TodaySession extends CalendarSession {
  displayTime: string
}

export interface AdminTeacher {
  id: string
  name: string
  email: string
  firstName: string
  salutation: string
  speciality: string
  color: string
  ratePerHour: number
  sessionsThisMonth: number
  hoursThisMonth: number
  estimatedPayThisMonth: number
}

export interface AdminTeacherDetail extends AdminTeacher {
  hoursThisMonth: number
  estimatedPayThisMonth: number
  availability: { weeklyPattern: Record<string, unknown>; exceptions: unknown[] } | null
  sessions: {
    id: string
    displayDateTime: string
    durationMin: number
    status: string
    student: { id: string; name: string }
    programme: { id: string; name: string; color: string }
  }[]
  payslips: AdminPayslip[]
}

export interface AdminPayslip {
  id: string
  periodStart: string
  periodEnd: string
  totalHours: number
  grossAmount: number
  status: string
  confirmedAt: string | null
}

export interface InvoiceItem {
  id: string
  description: string
  amount: number
  session: {
    id: string
    displayDate: string
    durationMin: number
    student: { id: string; name: string }
    programme: { id: string; name: string }
    teacher: { id: string; name: string }
  } | null
}

export interface AdminInvoice {
  id: string
  periodStart: string
  periodEnd: string
  dueDate: string
  status: string
  subtotal: number
  discount: number
  total: number
  paidAt: string | null
  parent: { id: string; name: string; email: string; phone: string | null }
  items: InvoiceItem[]
}

export interface AdminExpenses {
  month: string
  totalCost: number
  trend: { month: string; cost: number }[]
  byTeacher: {
    id: string
    name: string
    color: string
    ratePerHour: number
    sessions: number
    hours: number
    cost: number
  }[]
}

export interface AdminProgramme {
  id: string
  name: string
  slug: string
  category: string
  defaultDurationMin: number
  mascot: string
  color: string
  description: string
  teachers: string[]
}

export interface AdminParent {
  id: string
  name: string
  email: string
  phone: string | null
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => { await sleep(350); return getMockStats() },
    refetchInterval: 60_000,
  })
}

export function useAdminActivity() {
  return useQuery<ActivityEvent[]>({
    queryKey: ['admin', 'activity'],
    queryFn: async () => { await sleep(350); return getMockActivity() },
  })
}

export function useTodaySessions() {
  return useQuery<TodaySession[]>({
    queryKey: ['admin', 'today-sessions'],
    queryFn: async () => { await sleep(350); return getMockTodaySessions() },
  })
}

export function useAdminStudents(params?: {
  search?: string
  programme?: string
  packageType?: string
  status?: 'active' | 'archived'
}) {
  return useQuery<AdminStudent[]>({
    queryKey: ['admin', 'students', params],
    queryFn: async () => {
      await sleep(350)
      let result = [...MOCK_STUDENTS] as AdminStudent[]

      if (params?.status === 'archived') {
        result = result.filter(s => s.archived === true)
      } else {
        result = result.filter(s => s.archived === false)
      }

      if (params?.search) {
        const q = params.search.toLowerCase()
        result = result.filter(s =>
          s.name.toLowerCase().includes(q) ||
          s.parent.name.toLowerCase().includes(q)
        )
      }

      if (params?.programme) {
        result = result.filter(s =>
          s.enrollments.some(e => e.programme.slug === params.programme)
        )
      }

      if (params?.packageType) {
        result = result.filter(s =>
          s.enrollments.some(e => e.packageType === params.packageType)
        )
      }

      return result
    },
  })
}

export function useAdminStudent(id: string | null) {
  return useQuery<AdminStudentDetail>({
    queryKey: ['admin', 'student', id],
    queryFn: async () => {
      await sleep(350)
      const student = MOCK_STUDENTS.find(s => s.id === id)
      if (!student) throw new Error(`Student ${id} not found`)

      const allSessions = getMockCalendarSessions()
      const upcomingSessions = allSessions
        .filter(s => s.student.id === id && s.status === 'SCHEDULED')
        .slice(0, 5)
        .map(s => ({
          id: s.id,
          dateStr: s.dateStr,
          displayDateTime: `${s.displayDate} · ${s.displayTime}`,
          programme: s.programme.name,
          teacher: s.teacher.name,
          durationMin: s.durationMin,
        }))

      return { ...student, upcomingSessions } as AdminStudentDetail
    },
    enabled: !!id,
  })
}

export function useCreateStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_body: object) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'students'] })
      toast.success('Student created')
    },
    onError: () => toast.error('Failed to create student'),
  })
}

export function useUpdateStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_body: { id: string } & Record<string, unknown>) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'students'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'student'] })
      toast.success('Student saved')
    },
    onError: () => toast.error('Failed to save student'),
  })
}

export function useArchiveStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_id: string) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'students'] })
      toast.success('Student archived')
    },
    onError: () => toast.error('Failed to archive student'),
  })
}

export function useAdminCalendar(weekStart: string) {
  return useQuery<{ weekStart: string; sessions: CalendarSession[] }>({
    queryKey: ['admin', 'calendar', weekStart],
    queryFn: async () => {
      await sleep(350)
      const all = getMockCalendarSessions()
      const end = toDateStr(addDays(new Date(weekStart + 'T00:00:00'), 6))
      return { weekStart, sessions: all.filter(s => s.dateStr >= weekStart && s.dateStr <= end) }
    },
  })
}

export function useAdminTeachers() {
  return useQuery<AdminTeacher[]>({
    queryKey: ['admin', 'teachers'],
    queryFn: async () => { await sleep(350); return MOCK_TEACHERS },
    staleTime: 5 * 60_000,
  })
}

export function useAdminProgrammes() {
  return useQuery<AdminProgramme[]>({
    queryKey: ['admin', 'programmes'],
    queryFn: async () => { await sleep(350); return MOCK_PROGRAMMES as AdminProgramme[] },
    staleTime: 10 * 60_000,
  })
}

export function useCreateProgramme() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_body: object) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'programmes'] })
      toast.success('Programme created ✓')
    },
    onError: () => toast.error('Failed to create programme'),
  })
}

export function useUpdateProgramme() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_body: { id: string } & Record<string, unknown>) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'programmes'] })
      toast.success('Programme updated ✓')
    },
    onError: () => toast.error('Failed to update programme'),
  })
}

export function useAdminParents() {
  return useQuery<AdminParent[]>({
    queryKey: ['admin', 'parents'],
    queryFn: async () => { await sleep(350); return MOCK_PARENTS },
  })
}

export function useCreateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_body: object) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'calendar'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'today-sessions'] })
      toast.success('Class booked ✓')
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Booking conflict — check the calendar')
    },
  })
}

export function useUpdateClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_body: { id: string } & Record<string, unknown>) => { await sleep(500); return {} },
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['admin', 'calendar'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'today-sessions'] })
      const status = (vars as Record<string, unknown>).status
      if (status === 'COMPLETED') toast.success('Class marked complete')
      else if (status === 'CANCELLED') toast.success('Class cancelled')
      else toast.success('Class updated')
    },
    onError: () => toast.error('Failed to update class'),
  })
}

export function useRescheduleClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_body: { id: string } & Record<string, unknown>) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'calendar'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success('Class rescheduled ✓')
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Reschedule conflict')
    },
  })
}

// ─── Teacher detail ───────────────────────────────────────────────────────────

export function useAdminTeacherDetail(id: string | null) {
  return useQuery<AdminTeacherDetail>({
    queryKey: ['admin', 'teacher', id],
    queryFn: async () => { await sleep(350); return getMockAdminTeacherDetail(id!) as AdminTeacherDetail },
    enabled: !!id,
  })
}

export function useCreateTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_body: object) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'teachers'] })
      toast.success('Teacher account created')
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Failed to create teacher')
    },
  })
}

export function useUpdateTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_body: { id: string } & Record<string, unknown>) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'teachers'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'teacher'] })
      toast.success('Teacher updated')
    },
    onError: () => toast.error('Failed to update teacher'),
  })
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export function useAdminInvoices(params?: { status?: string; month?: string; parentId?: string }) {
  return useQuery<AdminInvoice[]>({
    queryKey: ['admin', 'invoices', params],
    queryFn: async () => {
      await sleep(350)
      let invoices = getMockInvoices() as AdminInvoice[]
      if (params?.status)   invoices = invoices.filter(i => i.status === params.status)
      if (params?.month)    invoices = invoices.filter(i => i.periodStart.startsWith(params.month!.slice(0, 7)))
      if (params?.parentId) invoices = invoices.filter(i => i.parent.id === params.parentId)
      return invoices
    },
  })
}

export function useAdminInvoice(id: string | null) {
  return useQuery<AdminInvoice>({
    queryKey: ['admin', 'invoice', id],
    queryFn: async () => {
      await sleep(350)
      const found = getMockInvoices().find(i => i.id === id)
      if (!found) throw new Error(`Invoice ${id} not found`)
      return found as AdminInvoice
    },
    enabled: !!id,
  })
}

export function useGenerateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_body: object) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'invoices'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success('Invoice generated')
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Failed to generate invoice')
    },
  })
}

export function useUpdateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_body: { id: string } & Record<string, unknown>) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'invoices'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'invoice'] })
      toast.success('Invoice updated')
    },
    onError: () => toast.error('Failed to update invoice'),
  })
}

export function useSendInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_id: string) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'invoices'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success('Invoice sent to parent')
    },
    onError: () => toast.error('Failed to send invoice'),
  })
}

export function useMarkInvoicePaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_id: string) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'invoices'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success('Invoice marked as paid ✓')
    },
    onError: () => toast.error('Failed to mark invoice paid'),
  })
}

export function useMarkInvoiceOverdue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_id: string) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'invoices'] })
      toast.success('Invoice marked as overdue')
    },
    onError: () => toast.error('Failed to update invoice'),
  })
}

export function useGenerateAllInvoices() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_body: object) => { await sleep(700); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'invoices'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success('Invoices generated for all clients ✓')
    },
    onError: () => toast.error('Failed to generate invoices'),
  })
}

export function useSendReminder() {
  return useMutation({
    mutationFn: async (_id: string) => { await sleep(400); return {} },
    onSuccess: () => toast.success('Payment reminder sent ✓'),
    onError: () => toast.error('Failed to send reminder'),
  })
}

// ─── Payslips ─────────────────────────────────────────────────────────────────

export function useGeneratePayslip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_body: object) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'teacher'] })
      toast.success('Payslip generated')
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Failed to generate payslip')
    },
  })
}

export function useConfirmPayslip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_id: string) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'teacher'] })
      toast.success('Payslip confirmed ✓')
    },
    onError: () => toast.error('Failed to confirm payslip'),
  })
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export function useAdminExpenses(month?: string) {
  return useQuery<AdminExpenses>({
    queryKey: ['admin', 'expenses', month],
    queryFn: async () => { await sleep(350); return getMockExpenses(month) },
  })
}

// ─── Dev Reset ────────────────────────────────────────────────────────────────

export function useDevReset() {
  return useMutation({
    mutationFn: async () => { await sleep(800); return {} },
    onSuccess: () => toast.success('Demo data refreshed ✓'),
  })
}
