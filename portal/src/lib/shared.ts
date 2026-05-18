// ─── Enums ───────────────────────────────────────────────────────────────────

export type Role = 'ADMIN' | 'PARENT' | 'TEACHER'

export type Category = 'LITERACY' | 'MATHS'

export type PackageType = 'MONTHLY' | 'BUNDLE_12' | 'BUNDLE_24'

export type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'

export type PayslipStatus = 'DRAFT' | 'CONFIRMED' | 'PAID'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string
  role: Role
  name: string
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  /** teacherId if TEACHER, parentId if PARENT */
  profileId?: string
}

// ─── Teachers ─────────────────────────────────────────────────────────────────

export interface TeacherDto {
  id: string
  userId: string
  name: string
  email: string
  speciality: string
  ratePerHour: number
  color: string
}

// ─── Programmes ───────────────────────────────────────────────────────────────

export interface ProgrammeDto {
  id: string
  name: string
  category: Category
  minAge: number
  maxAge: number | null
  description: string | null
  mascot: string
  color: string
}

// ─── Students ─────────────────────────────────────────────────────────────────

export interface StudentDto {
  id: string
  name: string
  dateOfBirth: string // ISO
  age: number
  parentId: string
  parentName: string
  enrollments: EnrollmentDto[]
}

export interface EnrollmentDto {
  id: string
  programmeId: string
  programmeName: string
  programmeCategory: Category
  packageType: PackageType
  startDate: string
  active: boolean
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export interface SessionDto {
  id: string
  studentId: string
  studentName: string
  teacherId: string
  teacherName: string
  programmeId: string
  programmeName: string
  programmeCategory: Category
  startTime: string // ISO
  durationMin: number
  status: SessionStatus
  notes?: string
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export interface InvoiceDto {
  id: string
  parentId: string
  parentName: string
  periodStart: string
  periodEnd: string
  dueDate: string
  status: InvoiceStatus
  subtotal: number
  discount: number
  total: number
  paidAt: string | null
  items: InvoiceItemDto[]
}

export interface InvoiceItemDto {
  id: string
  sessionId: string | null
  description: string
  amount: number
}

// ─── Payslips ─────────────────────────────────────────────────────────────────

export interface PayslipDto {
  id: string
  teacherId: string
  teacherName: string
  periodStart: string
  periodEnd: string
  totalHours: number
  grossAmount: number
  status: PayslipStatus
  confirmedAt: string | null
}

// ─── API response wrapper ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  details?: unknown
}

// ─── Discount helpers ─────────────────────────────────────────────────────────

export const PACKAGE_DISCOUNT: Record<PackageType, number> = {
  MONTHLY: 0,
  BUNDLE_12: 0.10,
  BUNDLE_24: 0.15,
}

export const PACKAGE_LABEL: Record<PackageType, string> = {
  MONTHLY: 'Monthly',
  BUNDLE_12: 'Bundle of 12',
  BUNDLE_24: 'Bundle of 24',
}
