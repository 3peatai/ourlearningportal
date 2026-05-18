import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  sleep,
  getMockTeacherDashboard,
  getMockTeacherWeekSessions,
  getMockTeacherAvailability,
  getMockTeacherClasses,
  getMockTeacherPayslips,
  getMockTeacherPayslipDetail,
} from '../lib/mock/data'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TeacherWeekSession {
  id: string
  dateStr: string       // 'yyyy-MM-dd' HKT
  displayDate: string
  displayTime: string
  programme: string
  mascot: string
  color: string
  durationMin: number
  status: string
  notes: string | null
  studentFirstName: string
}

export interface TeacherDashboardData {
  teacherName: string
  color: string
  speciality: string
  todayStr: string
  weekSessions: TeacherWeekSession[]
  thisWeekSummary: { totalSessions: number; totalHours: number }
  currentPeriodEarnings: number
  currentPeriod: string
}

export interface ExceptionItem {
  startDate: string
  endDate: string
  label?: string
}

export interface AvailabilityData {
  weeklyPattern: Record<string, string[]>
  exceptions: ExceptionItem[]
}

export interface TeacherWeekData {
  weekStart: string
  sessions: TeacherWeekSession[]
}

export interface TeacherClass {
  id: string
  dateStr: string
  displayDate: string
  displayTime: string
  displayDateTime: string
  programme: string
  mascot: string
  color: string
  durationMin: number
  status: string
  notes: string | null
  studentFirstName: string
}

export interface PayslipSummary {
  id: string
  period: string
  periodStart: string
  periodEnd: string
  grossAmount: number
  status: string
}

export interface PayslipItem {
  id: string
  date: string
  studentFirstName: string
  programme: string
  durationMin: number
  ratePerHour: number
  amount: number
}

export interface PayslipDetail extends PayslipSummary {
  totalSessions: number
  totalHours: number
  items: PayslipItem[]
  teacherName: string
  speciality: string
  ratePerHour: number
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useTeacherDashboard() {
  return useQuery<TeacherDashboardData>({
    queryKey: ['teacher', 'dashboard'],
    queryFn: async () => { await sleep(350); return getMockTeacherDashboard() },
  })
}

export function useTeacherWeekSessions(weekStart: string) {
  return useQuery<TeacherWeekData>({
    queryKey: ['teacher', 'sessions', weekStart],
    queryFn: async () => { await sleep(350); return getMockTeacherWeekSessions(weekStart) },
  })
}

export function useTeacherAvailability() {
  return useQuery<AvailabilityData>({
    queryKey: ['teacher', 'availability'],
    queryFn: async () => { await sleep(350); return getMockTeacherAvailability() },
  })
}

export function useSaveAvailability() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_body: AvailabilityData) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['teacher', 'availability'] })
      toast.success('Availability saved ✓')
    },
    onError: () => toast.error('Failed to save availability'),
  })
}

export function useTeacherClasses(status: 'upcoming' | 'past') {
  return useQuery<TeacherClass[]>({
    queryKey: ['teacher', 'classes', status],
    queryFn: async () => { await sleep(350); return getMockTeacherClasses(status) },
  })
}

export function useConfirmClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_id: string) => { await sleep(500); return {} },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['teacher', 'classes'] })
      void qc.invalidateQueries({ queryKey: ['teacher', 'dashboard'] })
      toast.success('Class confirmed ✓')
    },
    onError: () => toast.error('Failed to confirm class'),
  })
}

export function useTeacherPayslips() {
  return useQuery<PayslipSummary[]>({
    queryKey: ['teacher', 'payslips'],
    queryFn: async () => { await sleep(350); return getMockTeacherPayslips() },
  })
}

export function useTeacherPayslip(id?: string) {
  return useQuery<PayslipDetail>({
    queryKey: ['teacher', 'payslip', id ?? 'latest'],
    queryFn: async () => { await sleep(350); return getMockTeacherPayslipDetail(id) },
  })
}
