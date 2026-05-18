import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  sleep,
  getMockParentDashboard,
  getMockParentSessions,
  getMockParentSlots,
  getMockParentInvoices,
  getMockParentChildren,
  MOCK_PROGRAMMES,
} from '../lib/mock/data'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NextClass {
  studentName: string; teacherName: string; teacherColor: string;
  programme: string; mascot: string; category: string;
  startTime: string; displayTime: string; durationMin: number;
}

export interface InvoiceSummary {
  month: string; total: number; status: string; dueDate: string;
}

export interface MonthSession {
  id: string; date: string; displayDate: string; programme: string;
  mascot: string; teacher: string; durationMin: number; status: string;
}

export interface LessonInfo {
  studentName: string;
  programme: string;
  mascot: string;
  color: string;
  packageType: string;
  total: number | null;
  used: number;
  remaining: number | null;
}

export interface DashboardData {
  parentName: string;
  nextClass: NextClass | null;
  invoiceSummary: InvoiceSummary | null;
  thisMonthSessions: MonthSession[];
  lessonsInfo: LessonInfo[];
}

export interface CalendarSession {
  id: string;
  date: string;           // 'yyyy-MM-dd' in HKT
  displayTime: string;    // 'h:mm a'
  displayDateTime: string;
  programme: string;
  mascot: string;
  color: string;
  category: string;
  teacher: string;
  studentName: string;
  durationMin: number;
  status: string;
}

export interface Slot {
  id: string; date: string; displayDate: string; displayTime: string;
  teacherName: string; teacherColor: string; teacherId: string; available: boolean;
}

export interface SlotsData { slots: Slot[]; weekStart: string }

export interface InvoiceItem { id: string; description: string; amount: number }

export interface Invoice {
  id: string; month: string; total: number; subtotal: number; discount: number;
  status: string; dueDate: string; paidAt: string | null; items?: InvoiceItem[];
}

export interface Enrollment { programme: string; mascot: string; color: string; category: string; packageType: string }

export interface SessionItem {
  id: string; displayDate: string; programme: string; mascot: string;
  teacher: string; durationMin: number; status: string;
}

export interface Child {
  id: string; name: string; age: number;
  enrollments: Enrollment[];
  nextClass: { displayDate: string; programme: string; teacher: string } | null;
  upcomingSessions: SessionItem[];
  pastSessions: SessionItem[];
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useParentDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['parent', 'dashboard'],
    queryFn: async () => { await sleep(350); return getMockParentDashboard() },
  })
}

export function useParentSessions(month: string) {
  return useQuery<CalendarSession[]>({
    queryKey: ['parent', 'sessions', month],
    queryFn: async () => { await sleep(350); return getMockParentSessions(month) },
  })
}

export function useProgrammes() {
  return useQuery<{ id: string; name: string; slug: string; category: string; minAge: number; maxAge: number | null; mascot: string; color: string; description: string | null }[]>({
    queryKey: ['programmes'],
    queryFn: async () => { await sleep(350); return MOCK_PROGRAMMES },
  })
}

export function useParentSlots(programmeId: string, duration: number, weekStart: string) {
  return useQuery<SlotsData>({
    queryKey: ['parent', 'slots', programmeId, duration, weekStart],
    queryFn: async () => { await sleep(350); return getMockParentSlots(programmeId, duration, weekStart) },
    enabled: !!programmeId,
  })
}

export function useBookClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_body: { programmeId: string; teacherId: string; startTime: string; durationMin: number; isMakeup?: boolean }) => {
      await sleep(500); return {}
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['parent', 'dashboard'] })
      void qc.invalidateQueries({ queryKey: ['parent', 'slots'] })
      void qc.invalidateQueries({ queryKey: ['parent', 'sessions'] })
      toast.success('Class booked! 🎉')
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Failed to book class')
    },
  })
}

export function useParentInvoices() {
  return useQuery<Invoice[]>({
    queryKey: ['parent', 'invoices'],
    queryFn: async () => { await sleep(350); return getMockParentInvoices() },
  })
}

export function useCurrentInvoice() {
  return useQuery<Invoice>({
    queryKey: ['parent', 'invoices', 'current'],
    queryFn: async () => { await sleep(350); return getMockParentInvoices()[1] },
  })
}

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: ['parent', 'invoices', id],
    queryFn: async () => {
      await sleep(350)
      const invoices = getMockParentInvoices()
      return invoices.find(i => i.id === id) ?? invoices[0]
    },
    enabled: !!id,
  })
}

export function useParentChildren() {
  return useQuery<Child[]>({
    queryKey: ['parent', 'children'],
    queryFn: async () => { await sleep(350); return getMockParentChildren() },
  })
}
