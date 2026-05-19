// ─── Helpers ─────────────────────────────────────────────────────────────────

export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

export function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export function getMonday(d: Date) {
  const r = new Date(d)
  const day = r.getDay()
  r.setDate(r.getDate() - (day === 0 ? 6 : day - 1))
  return r
}

export function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function fmtDate(d: Date) {
  return d.toLocaleDateString('en-HK', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function fmtTime(h: number, m = 0) {
  const hr = h > 12 ? h - 12 : h === 0 ? 12 : h
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`
}

export function isoAt(d: Date, h: number, m = 0) {
  const r = new Date(d)
  r.setHours(h, m, 0, 0)
  return r.toISOString()
}

export function monthStr(d: Date) {
  return d.toLocaleDateString('en-HK', { month: 'long', year: 'numeric' })
}

// ─── Static Data ──────────────────────────────────────────────────────────────

export const MOCK_TEACHERS = [
  { id: 't1', name: 'Beverly Wong',  firstName: 'Beverly', salutation: 'Ms', email: 'beverly@booksandbrains.hk', speciality: 'Mathematics',     color: '#F5C842', ratePerHour: 350, sessionsThisMonth: 18, hoursThisMonth: 18, estimatedPayThisMonth: 6300 },
  { id: 't2', name: 'Tristan Hall',  firstName: 'Tristan', salutation: 'Mr', email: 'tristan@booksandbrains.hk', speciality: 'Literacy',         color: '#E8623A', ratePerHour: 300, sessionsThisMonth: 14, hoursThisMonth: 14, estimatedPayThisMonth: 4200 },
  { id: 't3', name: 'May Chen',      firstName: 'May',     salutation: 'Ms', email: 'may@booksandbrains.hk',     speciality: 'Science',           color: '#4AADBC', ratePerHour: 325, sessionsThisMonth: 10, hoursThisMonth: 15, estimatedPayThisMonth: 4875 },
  { id: 't4', name: 'Cato Patel',    firstName: 'Cato',    salutation: 'Mr', email: 'cato@booksandbrains.hk',    speciality: 'Creative Arts',     color: '#9B5DE5', ratePerHour: 280, sessionsThisMonth: 8,  hoursThisMonth: 8,  estimatedPayThisMonth: 2240 },
  { id: 't5', name: 'Gwen Torres',   firstName: 'Gwen',    salutation: 'Ms', email: 'gwen@booksandbrains.hk',    speciality: 'English Writing',   color: '#06D6A0', ratePerHour: 310, sessionsThisMonth: 12, hoursThisMonth: 18, estimatedPayThisMonth: 5580 },
  { id: 't6', name: 'Donna Lam',     firstName: 'Donna',   salutation: 'Ms', email: 'donna@booksandbrains.hk',   speciality: 'Music Theory',      color: '#F0A94A', ratePerHour: 290, sessionsThisMonth: 6,  hoursThisMonth: 6,  estimatedPayThisMonth: 1740 },
]

export const MOCK_PROGRAMMES = [
  { id: 'p1', name: 'Math Explorers',     slug: 'math-explorers',     category: 'MATHS',   defaultDurationMin: 60, mascot: '🦊', color: '#F5C842', minAge: 6,  maxAge: 12, description: 'Building strong mathematical foundations through play and exploration.',       teachers: ['t1'] },
  { id: 'p2', name: 'Reading Stars',      slug: 'reading-stars',      category: 'ENGLISH', defaultDurationMin: 60, mascot: '🦉', color: '#E8623A', minAge: 5,  maxAge: 10, description: 'Developing confident, enthusiastic readers through phonics and comprehension.', teachers: ['t2', 't6'] },
  { id: 'p3', name: 'Science Lab',        slug: 'science-lab',        category: 'SCIENCE', defaultDurationMin: 90, mascot: '🔬', color: '#4AADBC', minAge: 8,  maxAge: 14, description: 'Hands-on science experiments and STEM exploration.',                           teachers: ['t3'] },
  { id: 'p4', name: 'Creative Writing',   slug: 'creative-writing',   category: 'ENGLISH', defaultDurationMin: 60, mascot: '🎨', color: '#9B5DE5', minAge: 7,  maxAge: 13, description: 'Unlocking creativity through storytelling and expressive writing.',            teachers: ['t4'] },
  { id: 'p5', name: 'English Essentials', slug: 'english-essentials', category: 'ENGLISH', defaultDurationMin: 60, mascot: '✏️', color: '#06D6A0', minAge: 6,  maxAge: 12, description: 'Core English skills: grammar, vocabulary, and comprehension.',                teachers: ['t5'] },
  { id: 'p6', name: 'Music Theory',       slug: 'music-theory',       category: 'OTHER',   defaultDurationMin: 60, mascot: '🎵', color: '#F0A94A', minAge: 8,  maxAge: 15, description: 'Understanding music fundamentals: notation, rhythm, and harmony.',            teachers: ['t6'] },
]

export const MOCK_PARENTS = [
  { id: 'par1', name: 'Sarah Lam',     email: 'sarah.lam@hkmail.com',      phone: '+852 9123 4567' },
  { id: 'par2', name: 'David Wong',    email: 'david.wong@gmail.com',       phone: '+852 9234 5678' },
  { id: 'par3', name: 'Jennifer Kim',  email: 'jennifer.kim@outlook.com',   phone: '+852 9345 6789' },
  { id: 'par4', name: 'Michael Park',  email: 'michael.park@hkmail.com',    phone: '+852 9456 7890' },
  { id: 'par5', name: 'Lisa Chan',     email: 'lisa.chan@gmail.com',         phone: '+852 9567 8901' },
  { id: 'par6', name: 'Robert Ng',     email: 'robert.ng@hkmail.com',        phone: '+852 9678 9012' },
]

export const MOCK_STUDENTS = [
  {
    id: 's1', name: 'Emma Chen',   dateOfBirth: '2017-05-15', age: 8,  notes: null, archived: false, archivedAt: null,
    parent: { id: 'par1', name: 'Sarah Lam',     email: 'sarah.lam@hkmail.com',    phone: '+852 9123 4567' },
    enrollments: [
      { id: 'e1', programme: { id: 'p1', name: 'Math Explorers', slug: 'math-explorers', color: '#F5C842', mascot: '🦊' }, packageType: 'BUNDLE_12', startDate: '2025-09-01', bundleTotal: 12, used: 8, remaining: 4 },
    ],
    upcomingTeacher: { id: 't1', name: 'Beverly Wong' },
  },
  {
    id: 's2', name: 'Oliver Lam',  dateOfBirth: '2019-10-20', age: 6,  notes: null, archived: false, archivedAt: null,
    parent: { id: 'par1', name: 'Sarah Lam',     email: 'sarah.lam@hkmail.com',    phone: '+852 9123 4567' },
    enrollments: [
      { id: 'e2', programme: { id: 'p2', name: 'Reading Stars', slug: 'reading-stars', color: '#E8623A', mascot: '🦉' }, packageType: 'MONTHLY', startDate: '2025-09-01', bundleTotal: null, used: 4, remaining: null },
    ],
    upcomingTeacher: { id: 't2', name: 'Tristan Hall' },
  },
  {
    id: 's3', name: 'Lucas Wong',  dateOfBirth: '2015-03-08', age: 11, notes: null, archived: false, archivedAt: null,
    parent: { id: 'par2', name: 'David Wong',    email: 'david.wong@gmail.com',     phone: '+852 9234 5678' },
    enrollments: [
      { id: 'e3', programme: { id: 'p1', name: 'Math Explorers', slug: 'math-explorers', color: '#F5C842', mascot: '🦊' }, packageType: 'BUNDLE_24', startDate: '2025-09-01', bundleTotal: 24, used: 16, remaining: 8 },
      { id: 'e4', programme: { id: 'p3', name: 'Science Lab',    slug: 'science-lab',    color: '#4AADBC', mascot: '🔬' }, packageType: 'MONTHLY',   startDate: '2025-09-01', bundleTotal: null, used: 5, remaining: null },
    ],
    upcomingTeacher: { id: 't1', name: 'Beverly Wong' },
  },
  {
    id: 's4', name: 'Sophie Kim',  dateOfBirth: '2016-07-14', age: 9,  notes: null, archived: false, archivedAt: null,
    parent: { id: 'par3', name: 'Jennifer Kim',  email: 'jennifer.kim@outlook.com', phone: '+852 9345 6789' },
    enrollments: [
      { id: 'e5', programme: { id: 'p5', name: 'English Essentials', slug: 'english-essentials', color: '#06D6A0', mascot: '✏️' }, packageType: 'BUNDLE_12', startDate: '2025-09-01', bundleTotal: 12, used: 9, remaining: 3 },
    ],
    upcomingTeacher: { id: 't5', name: 'Gwen Torres' },
  },
  {
    id: 's5', name: 'Mia Kim',     dateOfBirth: '2018-12-01', age: 7,  notes: null, archived: false, archivedAt: null,
    parent: { id: 'par3', name: 'Jennifer Kim',  email: 'jennifer.kim@outlook.com', phone: '+852 9345 6789' },
    enrollments: [
      { id: 'e6', programme: { id: 'p4', name: 'Creative Writing', slug: 'creative-writing', color: '#9B5DE5', mascot: '🎨' }, packageType: 'MONTHLY', startDate: '2025-09-01', bundleTotal: null, used: 4, remaining: null },
    ],
    upcomingTeacher: { id: 't4', name: 'Cato Patel' },
  },
  {
    id: 's6', name: 'Aiden Park',  dateOfBirth: '2014-09-20', age: 11, notes: null, archived: false, archivedAt: null,
    parent: { id: 'par4', name: 'Michael Park',  email: 'michael.park@hkmail.com',  phone: '+852 9456 7890' },
    enrollments: [
      { id: 'e7', programme: { id: 'p3', name: 'Science Lab', slug: 'science-lab', color: '#4AADBC', mascot: '🔬' }, packageType: 'BUNDLE_12', startDate: '2025-09-01', bundleTotal: 12, used: 7, remaining: 5 },
    ],
    upcomingTeacher: { id: 't3', name: 'May Chen' },
  },
  {
    id: 's7', name: 'Noah Chan',   dateOfBirth: '2017-02-11', age: 9,  notes: null, archived: false, archivedAt: null,
    parent: { id: 'par5', name: 'Lisa Chan',     email: 'lisa.chan@gmail.com',       phone: '+852 9567 8901' },
    enrollments: [
      { id: 'e8', programme: { id: 'p2', name: 'Reading Stars', slug: 'reading-stars', color: '#E8623A', mascot: '🦉' }, packageType: 'MONTHLY', startDate: '2025-09-01', bundleTotal: null, used: 6, remaining: null },
    ],
    upcomingTeacher: { id: 't2', name: 'Tristan Hall' },
  },
  {
    id: 's8', name: 'Chloe Ng',    dateOfBirth: '2016-04-22', age: 9,  notes: null, archived: false, archivedAt: null,
    parent: { id: 'par6', name: 'Robert Ng',     email: 'robert.ng@hkmail.com',      phone: '+852 9678 9012' },
    enrollments: [
      { id: 'e9', programme: { id: 'p6', name: 'Music Theory', slug: 'music-theory', color: '#F0A94A', mascot: '🎵' }, packageType: 'BUNDLE_12', startDate: '2025-09-01', bundleTotal: 12, used: 4, remaining: 8 },
    ],
    upcomingTeacher: { id: 't6', name: 'Donna Lam' },
  },
]

// ─── Session lookup maps ───────────────────────────────────────────────────────

// [dayOfWeek(0=Mon), hour, studentId, teacherId, programmeId, durationMin]
type SessionTemplate = [number, number, string, string, string, number]

const SESSION_TEMPLATES: SessionTemplate[] = [
  [0, 10, 's1', 't1', 'p1', 60],
  [0, 10, 's7', 't2', 'p2', 60],  // overlaps Mon 10am — two classes at once
  [0, 14, 's3', 't1', 'p1', 60],
  [0, 11, 's3', 't3', 'p3', 90],
  [1, 14, 's2', 't2', 'p2', 60],
  [1, 16, 's5', 't4', 'p4', 60],
  [2, 10, 's1', 't1', 'p1', 60],
  [2, 15, 's4', 't5', 'p5', 90],
  [3, 14, 's2', 't2', 'p2', 60],
  [3, 14, 's4', 't5', 'p5', 60],  // overlaps Thu 2pm — two classes at once
  [3, 16, 's7', 't2', 'p2', 60],
  [3, 11, 's6', 't3', 'p3', 90],
  [4, 10, 's4', 't5', 'p5', 90],
  [4, 15, 's5', 't4', 'p4', 60],
  [4, 14, 's8', 't6', 'p6', 60],
  [5, 10, 's3', 't1', 'p1', 60],
  [5, 11, 's8', 't6', 'p6', 60],
  [5, 15, 's7', 't2', 'p2', 60],
]

function getStudentById(id: string) {
  return MOCK_STUDENTS.find(s => s.id === id)!
}

function getTeacherById(id: string) {
  return MOCK_TEACHERS.find(t => t.id === id)!
}

function getProgrammeById(id: string) {
  return MOCK_PROGRAMMES.find(p => p.id === id)!
}

// ─── Calendar Sessions ────────────────────────────────────────────────────────

export interface CalendarSessionData {
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
  notes: null
  student: { id: string; name: string }
  teacher: { id: string; name: string; color: string }
  programme: { id: string; name: string; slug: string; color: string }
}

export function getMockCalendarSessions(): CalendarSessionData[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const baseMonday = getMonday(new Date())
  baseMonday.setHours(0, 0, 0, 0)

  const sessions: CalendarSessionData[] = []

  for (let weekOffset = -4; weekOffset <= 4; weekOffset++) {
    const weekMonday = addDays(baseMonday, weekOffset * 7)

    for (const [dayOfWeek, hour, studentId, teacherId, programmeId, durationMin] of SESSION_TEMPLATES) {
      const sessionDate = addDays(weekMonday, dayOfWeek)
      sessionDate.setHours(0, 0, 0, 0)
      const student = getStudentById(studentId)
      const teacher = getTeacherById(teacherId)
      const programme = getProgrammeById(programmeId)
      const status = sessionDate < today ? 'COMPLETED' : 'SCHEDULED'

      sessions.push({
        id: `sess-w${weekOffset}-d${dayOfWeek}-h${hour}-t${teacherId}`,
        dateStr: toDateStr(sessionDate),
        displayDate: fmtDate(sessionDate),
        displayTime: fmtTime(hour),
        startTimeISO: isoAt(sessionDate, hour),
        hktHour: hour,
        hktMin: 0,
        durationMin,
        status,
        isMakeup: false,
        notes: null,
        student: { id: student.id, name: student.name },
        teacher: { id: teacher.id, name: teacher.name, color: teacher.color },
        programme: { id: programme.id, name: programme.name, slug: programme.slug, color: programme.color },
      })
    }
  }

  return sessions
}

export function getMockTodaySessions(): CalendarSessionData[] {
  const todayStr = toDateStr(new Date())
  const today = new Date()
  return [
    {
      id: 'today-1',
      dateStr: todayStr,
      displayDate: fmtDate(today),
      displayTime: fmtTime(10),
      startTimeISO: isoAt(today, 10),
      hktHour: 10,
      hktMin: 0,
      durationMin: 60,
      status: 'SCHEDULED',
      isMakeup: false,
      notes: null,
      student: { id: 's1', name: 'Emma Chen' },
      teacher: { id: 't1', name: 'Beverly Wong', color: '#F5C842' },
      programme: { id: 'p1', name: 'Math Explorers', slug: 'math-explorers', color: '#F5C842' },
    },
    {
      id: 'today-2',
      dateStr: todayStr,
      displayDate: fmtDate(today),
      displayTime: fmtTime(14),
      startTimeISO: isoAt(today, 14),
      hktHour: 14,
      hktMin: 0,
      durationMin: 60,
      status: 'SCHEDULED',
      isMakeup: false,
      notes: null,
      student: { id: 's2', name: 'Oliver Lam' },
      teacher: { id: 't2', name: 'Tristan Hall', color: '#E8623A' },
      programme: { id: 'p2', name: 'Reading Stars', slug: 'reading-stars', color: '#E8623A' },
    },
    {
      id: 'today-3',
      dateStr: todayStr,
      displayDate: fmtDate(today),
      displayTime: fmtTime(15),
      startTimeISO: isoAt(today, 15),
      hktHour: 15,
      hktMin: 0,
      durationMin: 90,
      status: 'SCHEDULED',
      isMakeup: false,
      notes: null,
      student: { id: 's4', name: 'Sophie Kim' },
      teacher: { id: 't5', name: 'Gwen Torres', color: '#06D6A0' },
      programme: { id: 'p5', name: 'English Essentials', slug: 'english-essentials', color: '#06D6A0' },
    },
  ]
}

export function getMockStats() {
  return {
    activeStudents: 8,
    classesToday: 3,
    outstandingInvoices: { count: 4, total: 12400 },
    monthlyTeacherCost: 24935,
  }
}

export function getMockActivity() {
  const now = Date.now()
  return [
    { id: 'act1', type: 'invoice_paid'     as const, description: 'Sarah Lam paid invoice #INV-024 — HKD 2,340',                         timestamp: new Date(now - 2   * 60000).toISOString() },
    { id: 'act2', type: 'class_booked'     as const, description: 'New class booked: Emma Chen · Math Explorers · Beverly Wong',           timestamp: new Date(now - 45  * 60000).toISOString() },
    { id: 'act3', type: 'invoice_sent'     as const, description: 'Invoice #INV-025 sent to David Wong — HKD 2,720',                       timestamp: new Date(now - 3   * 3600000).toISOString() },
    { id: 'act4', type: 'student_enrolled' as const, description: 'Noah Chan enrolled in Reading Stars with Tristan Hall',                 timestamp: new Date(now - 5   * 3600000).toISOString() },
    { id: 'act5', type: 'invoice_overdue'  as const, description: 'Invoice #INV-022 overdue — Michael Park — HKD 1,620',                   timestamp: new Date(now - 1   * 86400000).toISOString() },
    { id: 'act6', type: 'reschedule'       as const, description: 'Class rescheduled: Lucas Wong · Science Lab — moved to Thursday 11am',  timestamp: new Date(now - 2   * 86400000).toISOString() },
    { id: 'act7', type: 'class_booked'     as const, description: 'New class booked: Chloe Ng · Music Theory · Donna Lam',                 timestamp: new Date(now - 3   * 86400000).toISOString() },
    { id: 'act8', type: 'invoice_paid'     as const, description: 'David Wong paid invoice #INV-021 — HKD 2,720',                         timestamp: new Date(now - 5   * 86400000).toISOString() },
  ]
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export function getMockInvoices(params?: { status?: string; month?: string; parentId?: string }) {
  const today = new Date()

  // Date helpers
  function daysAgo(n: number) { return toDateStr(addDays(today, -n)) }
  function daysFromNow(n: number) { return toDateStr(addDays(today, n)) }
  function monthsAgo(n: number) { return addDays(today, -n * 30) }

  function firstOfMonth(d: Date) {
    const r = new Date(d)
    r.setDate(1)
    return toDateStr(r)
  }
  function lastOfMonth(d: Date) {
    const r = new Date(d)
    r.setMonth(r.getMonth() + 1, 0)
    return toDateStr(r)
  }

  const march = monthsAgo(3)
  const april = monthsAgo(1)
  const may = today

  const all = [
    {
      id: 'inv1',
      periodStart: firstOfMonth(march),
      periodEnd: lastOfMonth(march),
      dueDate: daysAgo(21 + 14),
      status: 'PAID',
      subtotal: 2600,
      discount: 260,
      total: 2340,
      paidAt: new Date(today.getTime() - 21 * 86400000).toISOString(),
      parent: { id: 'par1', name: 'Sarah Lam', email: 'sarah.lam@hkmail.com', phone: '+852 9123 4567' },
      items: [
        { id: 'item-inv1-1', description: 'Math Explorers · Emma Chen · 4 sessions (60 min each)', amount: 1400, session: null },
        { id: 'item-inv1-2', description: 'Reading Stars · Oliver Lam · 4 sessions (60 min each)', amount: 1200, session: null },
      ],
    },
    {
      id: 'inv2',
      periodStart: firstOfMonth(march),
      periodEnd: lastOfMonth(march),
      dueDate: daysAgo(21 + 14),
      status: 'PAID',
      subtotal: 3200,
      discount: 480,
      total: 2720,
      paidAt: new Date(today.getTime() - 21 * 86400000).toISOString(),
      parent: { id: 'par2', name: 'David Wong', email: 'david.wong@gmail.com', phone: '+852 9234 5678' },
      items: [
        { id: 'item-inv2-1', description: 'Math Explorers · Lucas Wong · 4 sessions (60 min each)', amount: 1400, session: null },
        { id: 'item-inv2-2', description: 'Science Lab · Lucas Wong · 4 sessions (90 min each)', amount: 1800, session: null },
      ],
    },
    {
      id: 'inv3',
      periodStart: firstOfMonth(april),
      periodEnd: lastOfMonth(april),
      dueDate: daysAgo(14),
      status: 'SENT',
      subtotal: 2600,
      discount: 260,
      total: 2340,
      paidAt: null,
      parent: { id: 'par1', name: 'Sarah Lam', email: 'sarah.lam@hkmail.com', phone: '+852 9123 4567' },
      items: [
        { id: 'item-inv3-1', description: 'Math Explorers · Emma Chen · 4 sessions (60 min each)', amount: 1400, session: null },
        { id: 'item-inv3-2', description: 'Reading Stars · Oliver Lam · 4 sessions (60 min each)', amount: 1200, session: null },
      ],
    },
    {
      id: 'inv4',
      periodStart: firstOfMonth(april),
      periodEnd: lastOfMonth(april),
      dueDate: daysFromNow(5),
      status: 'SENT',
      subtotal: 3200,
      discount: 480,
      total: 2720,
      paidAt: null,
      parent: { id: 'par2', name: 'David Wong', email: 'david.wong@gmail.com', phone: '+852 9234 5678' },
      items: [
        { id: 'item-inv4-1', description: 'Math Explorers · Lucas Wong · 4 sessions (60 min each)', amount: 1400, session: null },
        { id: 'item-inv4-2', description: 'Science Lab · Lucas Wong · 4 sessions (90 min each)', amount: 1800, session: null },
      ],
    },
    {
      id: 'inv5',
      periodStart: firstOfMonth(april),
      periodEnd: lastOfMonth(april),
      dueDate: daysAgo(10),
      status: 'OVERDUE',
      subtotal: 1800,
      discount: 180,
      total: 1620,
      paidAt: null,
      parent: { id: 'par4', name: 'Michael Park', email: 'michael.park@hkmail.com', phone: '+852 9456 7890' },
      items: [
        { id: 'item-inv5-1', description: 'Science Lab · Aiden Park · 4 sessions (90 min each)', amount: 1800, session: null },
      ],
    },
    {
      id: 'inv6',
      periodStart: firstOfMonth(may),
      periodEnd: lastOfMonth(may),
      dueDate: daysFromNow(20),
      status: 'PAID',
      subtotal: 1200,
      discount: 120,
      total: 1080,
      paidAt: new Date(today.getTime() - 2 * 86400000).toISOString(),
      parent: { id: 'par1', name: 'Sarah Lam', email: 'sarah.lam@hkmail.com', phone: '+852 9123 4567' },
      items: [
        { id: 'item-inv6-1', description: 'Math Explorers · Emma Chen · 2 sessions (60 min each)', amount: 700,  session: null },
        { id: 'item-inv6-2', description: 'Reading Stars · Oliver Lam · 2 sessions (60 min each)', amount: 500,  session: null },
      ],
    },
    // ── Jennifer Kim (par3) ──────────────────────────────────────────────────
    {
      id: 'inv7',
      periodStart: firstOfMonth(march),
      periodEnd: lastOfMonth(march),
      dueDate: daysAgo(21 + 14),
      status: 'PAID',
      subtotal: 2200,
      discount: 220,
      total: 1980,
      paidAt: new Date(today.getTime() - 30 * 86400000).toISOString(),
      parent: { id: 'par3', name: 'Jennifer Kim', email: 'jennifer.kim@outlook.com', phone: '+852 9345 6789' },
      items: [
        { id: 'item-inv7-1', description: 'English Essentials · Sophie Kim · 4 sessions (60 min each)', amount: 1200, session: null },
        { id: 'item-inv7-2', description: 'Creative Writing · Mia Kim · 4 sessions (60 min each)', amount: 1000, session: null },
      ],
    },
    {
      id: 'inv8',
      periodStart: firstOfMonth(april),
      periodEnd: lastOfMonth(april),
      dueDate: daysAgo(10),
      status: 'OVERDUE',
      subtotal: 2200,
      discount: 220,
      total: 1980,
      paidAt: null,
      parent: { id: 'par3', name: 'Jennifer Kim', email: 'jennifer.kim@outlook.com', phone: '+852 9345 6789' },
      items: [
        { id: 'item-inv8-1', description: 'English Essentials · Sophie Kim · 4 sessions (60 min each)', amount: 1200, session: null },
        { id: 'item-inv8-2', description: 'Creative Writing · Mia Kim · 4 sessions (60 min each)', amount: 1000, session: null },
      ],
    },
    {
      id: 'inv9',
      periodStart: firstOfMonth(may),
      periodEnd: lastOfMonth(may),
      dueDate: daysAgo(4),
      status: 'OVERDUE',
      subtotal: 2200,
      discount: 220,
      total: 1980,
      paidAt: null,
      parent: { id: 'par3', name: 'Jennifer Kim', email: 'jennifer.kim@outlook.com', phone: '+852 9345 6789' },
      items: [
        { id: 'item-inv9-1', description: 'English Essentials · Sophie Kim · 2 sessions (60 min each)', amount: 600, session: null },
        { id: 'item-inv9-2', description: 'Creative Writing · Mia Kim · 2 sessions (60 min each)', amount: 500, session: null },
      ],
    },
    // ── Lisa Chan (par5) ─────────────────────────────────────────────────────
    {
      id: 'inv10',
      periodStart: firstOfMonth(march),
      periodEnd: lastOfMonth(march),
      dueDate: daysAgo(21 + 14),
      status: 'PAID',
      subtotal: 1200,
      discount: 0,
      total: 1200,
      paidAt: new Date(today.getTime() - 28 * 86400000).toISOString(),
      parent: { id: 'par5', name: 'Lisa Chan', email: 'lisa.chan@gmail.com', phone: '+852 9567 8901' },
      items: [
        { id: 'item-inv10-1', description: 'Reading Stars · Noah Chan · 4 sessions (60 min each)', amount: 1200, session: null },
      ],
    },
    {
      id: 'inv11',
      periodStart: firstOfMonth(april),
      periodEnd: lastOfMonth(april),
      dueDate: daysFromNow(6),
      status: 'SENT',
      subtotal: 1200,
      discount: 0,
      total: 1200,
      paidAt: null,
      parent: { id: 'par5', name: 'Lisa Chan', email: 'lisa.chan@gmail.com', phone: '+852 9567 8901' },
      items: [
        { id: 'item-inv11-1', description: 'Reading Stars · Noah Chan · 4 sessions (60 min each)', amount: 1200, session: null },
      ],
    },
    {
      id: 'inv12',
      periodStart: firstOfMonth(may),
      periodEnd: lastOfMonth(may),
      dueDate: daysFromNow(5),
      status: 'SENT',
      subtotal: 1200,
      discount: 0,
      total: 1200,
      paidAt: null,
      parent: { id: 'par5', name: 'Lisa Chan', email: 'lisa.chan@gmail.com', phone: '+852 9567 8901' },
      items: [
        { id: 'item-inv12-1', description: 'Reading Stars · Noah Chan · 2 sessions (60 min each)', amount: 600, session: null },
      ],
    },
    // ── Robert Ng (par6) ─────────────────────────────────────────────────────
    {
      id: 'inv13',
      periodStart: firstOfMonth(march),
      periodEnd: lastOfMonth(march),
      dueDate: daysAgo(21 + 14),
      status: 'PAID',
      subtotal: 1560,
      discount: 0,
      total: 1560,
      paidAt: new Date(today.getTime() - 25 * 86400000).toISOString(),
      parent: { id: 'par6', name: 'Robert Ng', email: 'robert.ng@hkmail.com', phone: '+852 9678 9012' },
      items: [
        { id: 'item-inv13-1', description: 'Music Theory · Chloe Ng · 4 sessions (60 min each)', amount: 1560, session: null },
      ],
    },
    {
      id: 'inv14',
      periodStart: firstOfMonth(april),
      periodEnd: lastOfMonth(april),
      dueDate: daysFromNow(12),
      status: 'SENT',
      subtotal: 1560,
      discount: 0,
      total: 1560,
      paidAt: null,
      parent: { id: 'par6', name: 'Robert Ng', email: 'robert.ng@hkmail.com', phone: '+852 9678 9012' },
      items: [
        { id: 'item-inv14-1', description: 'Music Theory · Chloe Ng · 4 sessions (60 min each)', amount: 1560, session: null },
      ],
    },
    {
      id: 'inv15',
      periodStart: firstOfMonth(may),
      periodEnd: lastOfMonth(may),
      dueDate: daysFromNow(16),
      status: 'SENT',
      subtotal: 1560,
      discount: 0,
      total: 1560,
      paidAt: null,
      parent: { id: 'par6', name: 'Robert Ng', email: 'robert.ng@hkmail.com', phone: '+852 9678 9012' },
      items: [
        { id: 'item-inv15-1', description: 'Music Theory · Chloe Ng · 2 sessions (60 min each)', amount: 780, session: null },
      ],
    },
    // ── Michael Park (par4) — May ─────────────────────────────────────────────
    {
      id: 'inv16',
      periodStart: firstOfMonth(may),
      periodEnd: lastOfMonth(may),
      dueDate: daysAgo(1),
      status: 'SENT',
      subtotal: 1800,
      discount: 180,
      total: 1620,
      paidAt: null,
      parent: { id: 'par4', name: 'Michael Park', email: 'michael.park@hkmail.com', phone: '+852 9456 7890' },
      items: [
        { id: 'item-inv16-1', description: 'Science Lab · Aiden Park · 2 sessions (90 min each)', amount: 900, session: null },
      ],
    },
    // ── David Wong (par2) — May ───────────────────────────────────────────────
    {
      id: 'inv17',
      periodStart: firstOfMonth(may),
      periodEnd: lastOfMonth(may),
      dueDate: daysFromNow(3),
      status: 'SENT',
      subtotal: 3200,
      discount: 480,
      total: 2720,
      paidAt: null,
      parent: { id: 'par2', name: 'David Wong', email: 'david.wong@gmail.com', phone: '+852 9234 5678' },
      items: [
        { id: 'item-inv17-1', description: 'Math Explorers · Lucas Wong · 2 sessions (60 min each)', amount: 700, session: null },
        { id: 'item-inv17-2', description: 'Science Lab · Lucas Wong · 2 sessions (90 min each)', amount: 900, session: null },
      ],
    },
  ]

  let result = all
  if (params?.status)   result = result.filter(i => i.status === params.status)
  if (params?.month)    result = result.filter(i => i.periodStart.startsWith(params.month!.slice(0, 7)))
  if (params?.parentId) result = result.filter(i => i.parent.id === params.parentId)
  return result
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export function getMockExpenses(month?: string) {
  const today = new Date()
  return {
    month: month ?? monthStr(today),
    totalCost: 24935,
    trend: [
      { month: monthStr(addDays(today, -5 * 30)), cost: 18200 },
      { month: monthStr(addDays(today, -4 * 30)), cost: 21400 },
      { month: monthStr(addDays(today, -3 * 30)), cost: 22800 },
      { month: monthStr(addDays(today, -2 * 30)), cost: 19600 },
      { month: monthStr(addDays(today, -1 * 30)), cost: 23100 },
      { month: monthStr(today),                   cost: 24935 },
    ],
    byTeacher: [
      { id: 't1', name: 'Beverly Wong', color: '#F5C842', ratePerHour: 350, sessions: 18, hours: 18, cost: 6300 },
      { id: 't2', name: 'Tristan Hall', color: '#E8623A', ratePerHour: 300, sessions: 14, hours: 14, cost: 4200 },
      { id: 't3', name: 'May Chen',     color: '#4AADBC', ratePerHour: 325, sessions: 10, hours: 15, cost: 4875 },
      { id: 't4', name: 'Cato Patel',   color: '#9B5DE5', ratePerHour: 280, sessions: 8,  hours: 8,  cost: 2240 },
      { id: 't5', name: 'Gwen Torres',  color: '#06D6A0', ratePerHour: 310, sessions: 12, hours: 18, cost: 5580 },
      { id: 't6', name: 'Donna Lam',    color: '#F0A94A', ratePerHour: 290, sessions: 6,  hours: 6,  cost: 1740 },
    ],
  }
}

// ─── Admin Teacher Detail ─────────────────────────────────────────────────────

function firstDayOfMonthStr(d: Date) {
  const r = new Date(d); r.setDate(1); return toDateStr(r)
}
function lastDayOfMonthStr(d: Date) {
  const r = new Date(d); r.setMonth(r.getMonth() + 1, 0); return toDateStr(r)
}

function mapSessions(allSessions: CalendarSessionData[], teacherId: string) {
  return allSessions
    .filter(s => s.teacher.id === teacherId && s.status === 'COMPLETED')
    .slice(-10)
    .map(s => ({
      id: s.id,
      displayDateTime: `${s.displayDate} · ${s.displayTime}`,
      durationMin: s.durationMin,
      status: s.status,
      student: s.student,
      programme: { id: s.programme.id, name: s.programme.name, color: s.programme.color },
    }))
}

export function getMockAdminTeacherDetail(id: string) {
  const teacher = getTeacherById(id)
  const allSessions = getMockCalendarSessions()
  const today = new Date()
  const twoMonthsAgo = addDays(today, -60)
  const oneMonthAgo  = addDays(today, -30)

  if (id === 't1') {
    return {
      ...teacher,
      availability: {
        weeklyPattern: {
          MON: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
          TUE: ['14:00', '15:00', '16:00', '17:00'],
          WED: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
          THU: ['14:00', '15:00', '16:00', '17:00'],
          FRI: ['10:00', '11:00', '12:00', '13:00', '14:00'],
          SAT: ['10:00', '11:00', '12:00'],
        },
        exceptions: [],
      },
      sessions: mapSessions(allSessions, 't1'),
      payslips: [
        { id: 'ps-t1-1', periodStart: firstDayOfMonthStr(twoMonthsAgo), periodEnd: lastDayOfMonthStr(twoMonthsAgo), totalHours: 22, grossAmount: 7700, status: 'CONFIRMED', confirmedAt: new Date(today.getTime() - 45 * 86400000).toISOString() },
        { id: 'ps-t1-2', periodStart: firstDayOfMonthStr(oneMonthAgo),  periodEnd: lastDayOfMonthStr(oneMonthAgo),  totalHours: 24, grossAmount: 8400, status: 'CONFIRMED', confirmedAt: new Date(today.getTime() - 14 * 86400000).toISOString() },
        { id: 'ps-t1-3', periodStart: firstDayOfMonthStr(today),        periodEnd: lastDayOfMonthStr(today),        totalHours: 18, grossAmount: 6300, status: 'DRAFT',     confirmedAt: null },
      ],
    }
  }

  if (id === 't2') {
    return {
      ...teacher,
      availability: {
        weeklyPattern: {
          MON: ['14:00', '15:00', '16:00', '17:00', '18:00'],
          TUE: ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
          WED: ['14:00', '15:00', '16:00', '17:00'],
          THU: ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
          FRI: ['14:00', '15:00', '16:00', '17:00', '18:00'],
          SAT: ['10:00', '11:00', '12:00'],
        },
        exceptions: [
          { startDate: toDateStr(addDays(today, 10)), endDate: toDateStr(addDays(today, 12)), reason: 'Family trip' },
        ],
      },
      sessions: mapSessions(allSessions, 't2'),
      payslips: [
        { id: 'ps-t2-1', periodStart: firstDayOfMonthStr(twoMonthsAgo), periodEnd: lastDayOfMonthStr(twoMonthsAgo), totalHours: 16, grossAmount: 4800, status: 'CONFIRMED', confirmedAt: new Date(today.getTime() - 43 * 86400000).toISOString() },
        { id: 'ps-t2-2', periodStart: firstDayOfMonthStr(oneMonthAgo),  periodEnd: lastDayOfMonthStr(oneMonthAgo),  totalHours: 14, grossAmount: 4200, status: 'CONFIRMED', confirmedAt: new Date(today.getTime() - 12 * 86400000).toISOString() },
        { id: 'ps-t2-3', periodStart: firstDayOfMonthStr(today),        periodEnd: lastDayOfMonthStr(today),        totalHours: 14, grossAmount: 4200, status: 'DRAFT',     confirmedAt: null },
      ],
    }
  }

  if (id === 't3') {
    return {
      ...teacher,
      availability: {
        weeklyPattern: {
          TUE: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
          THU: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
          SAT: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
        },
        exceptions: [],
      },
      sessions: mapSessions(allSessions, 't3'),
      payslips: [
        { id: 'ps-t3-1', periodStart: firstDayOfMonthStr(twoMonthsAgo), periodEnd: lastDayOfMonthStr(twoMonthsAgo), totalHours: 18, grossAmount: 5850, status: 'CONFIRMED', confirmedAt: new Date(today.getTime() - 41 * 86400000).toISOString() },
        { id: 'ps-t3-2', periodStart: firstDayOfMonthStr(oneMonthAgo),  periodEnd: lastDayOfMonthStr(oneMonthAgo),  totalHours: 15, grossAmount: 4875, status: 'CONFIRMED', confirmedAt: new Date(today.getTime() - 10 * 86400000).toISOString() },
        { id: 'ps-t3-3', periodStart: firstDayOfMonthStr(today),        periodEnd: lastDayOfMonthStr(today),        totalHours: 15, grossAmount: 4875, status: 'DRAFT',     confirmedAt: null },
      ],
    }
  }

  if (id === 't4') {
    return {
      ...teacher,
      availability: {
        weeklyPattern: {
          MON: ['15:00', '16:00', '17:00', '18:00'],
          TUE: ['15:00', '16:00', '17:00', '18:00', '19:00'],
          WED: ['15:00', '16:00', '17:00', '18:00'],
          THU: ['15:00', '16:00', '17:00', '18:00', '19:00'],
          FRI: ['14:00', '15:00', '16:00', '17:00', '18:00'],
        },
        exceptions: [
          { startDate: toDateStr(addDays(today, 5)), endDate: toDateStr(addDays(today, 5)), reason: 'Workshop' },
        ],
      },
      sessions: mapSessions(allSessions, 't4'),
      payslips: [
        { id: 'ps-t4-1', periodStart: firstDayOfMonthStr(twoMonthsAgo), periodEnd: lastDayOfMonthStr(twoMonthsAgo), totalHours: 10, grossAmount: 2800, status: 'CONFIRMED', confirmedAt: new Date(today.getTime() - 40 * 86400000).toISOString() },
        { id: 'ps-t4-2', periodStart: firstDayOfMonthStr(oneMonthAgo),  periodEnd: lastDayOfMonthStr(oneMonthAgo),  totalHours: 8,  grossAmount: 2240, status: 'CONFIRMED', confirmedAt: new Date(today.getTime() - 9 * 86400000).toISOString() },
        { id: 'ps-t4-3', periodStart: firstDayOfMonthStr(today),        periodEnd: lastDayOfMonthStr(today),        totalHours: 8,  grossAmount: 2240, status: 'DRAFT',     confirmedAt: null },
      ],
    }
  }

  if (id === 't5') {
    return {
      ...teacher,
      availability: {
        weeklyPattern: {
          MON: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
          WED: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
          FRI: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
          SAT: ['10:00', '11:00', '12:00', '13:00'],
        },
        exceptions: [],
      },
      sessions: mapSessions(allSessions, 't5'),
      payslips: [
        { id: 'ps-t5-1', periodStart: firstDayOfMonthStr(twoMonthsAgo), periodEnd: lastDayOfMonthStr(twoMonthsAgo), totalHours: 20, grossAmount: 6200, status: 'CONFIRMED', confirmedAt: new Date(today.getTime() - 42 * 86400000).toISOString() },
        { id: 'ps-t5-2', periodStart: firstDayOfMonthStr(oneMonthAgo),  periodEnd: lastDayOfMonthStr(oneMonthAgo),  totalHours: 18, grossAmount: 5580, status: 'CONFIRMED', confirmedAt: new Date(today.getTime() - 11 * 86400000).toISOString() },
        { id: 'ps-t5-3', periodStart: firstDayOfMonthStr(today),        periodEnd: lastDayOfMonthStr(today),        totalHours: 18, grossAmount: 5580, status: 'DRAFT',     confirmedAt: null },
      ],
    }
  }

  if (id === 't6') {
    return {
      ...teacher,
      availability: {
        weeklyPattern: {
          MON: ['14:00', '15:00', '16:00', '17:00', '18:00'],
          TUE: ['14:00', '15:00', '16:00', '17:00', '18:00'],
          WED: ['14:00', '15:00', '16:00', '17:00', '18:00'],
          FRI: ['14:00', '15:00', '16:00', '17:00'],
          SAT: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
        },
        exceptions: [],
      },
      sessions: mapSessions(allSessions, 't6'),
      payslips: [
        { id: 'ps-t6-1', periodStart: firstDayOfMonthStr(twoMonthsAgo), periodEnd: lastDayOfMonthStr(twoMonthsAgo), totalHours: 8,  grossAmount: 2320, status: 'CONFIRMED', confirmedAt: new Date(today.getTime() - 44 * 86400000).toISOString() },
        { id: 'ps-t6-2', periodStart: firstDayOfMonthStr(oneMonthAgo),  periodEnd: lastDayOfMonthStr(oneMonthAgo),  totalHours: 6,  grossAmount: 1740, status: 'CONFIRMED', confirmedAt: new Date(today.getTime() - 13 * 86400000).toISOString() },
        { id: 'ps-t6-3', periodStart: firstDayOfMonthStr(today),        periodEnd: lastDayOfMonthStr(today),        totalHours: 6,  grossAmount: 1740, status: 'DRAFT',     confirmedAt: null },
      ],
    }
  }

  return { ...teacher, availability: null, sessions: [], payslips: [] }
}

// ─── Parent Mock Data ─────────────────────────────────────────────────────────

export function getMockParentDashboard() {
  const today = new Date()
  const monday = getMonday(today)
  const nextMonday = addDays(monday, 7)

  const allSessions = getMockCalendarSessions()
  const currentMonthPrefix = toDateStr(today).slice(0, 7)

  const thisMonthCompleted = allSessions
    .filter(s => (s.student.id === 's1' || s.student.id === 's2') && s.status === 'COMPLETED' && s.dateStr.startsWith(currentMonthPrefix))
    .slice(-4)
    .map(s => ({
      id: s.id,
      date: s.dateStr,
      displayDate: s.displayDate,
      programme: s.programme.name,
      mascot: getProgrammeById(s.programme.id).mascot,
      teacher: s.teacher.name,
      durationMin: s.durationMin,
      status: s.status,
    }))

  return {
    parentName: 'Sarah Lam',
    nextClass: {
      studentName: 'Emma Chen',
      teacherName: 'Beverly Wong',
      teacherColor: '#F5C842',
      programme: 'Math Explorers',
      mascot: '🦊',
      category: 'MATHS',
      startTime: isoAt(nextMonday, 10),
      displayTime: `${fmtDate(nextMonday)} · 10:00 AM`,
      durationMin: 60,
    },
    invoiceSummary: {
      month: 'April 2026',
      total: 2340,
      status: 'SENT',
      dueDate: toDateStr(addDays(today, 5)),
    },
    thisMonthSessions: thisMonthCompleted,
    lessonsInfo: [
      { studentName: 'Emma Chen',  programme: 'Math Explorers', mascot: '🦊', color: '#F5C842', packageType: 'BUNDLE_12', total: 12,   used: 8, remaining: 4    },
      { studentName: 'Oliver Lam', programme: 'Reading Stars',  mascot: '🦉', color: '#E8623A', packageType: 'MONTHLY',   total: null, used: 4, remaining: null },
    ],
  }
}

export function getMockParentSessions(month: string) {
  const allSessions = getMockCalendarSessions()
  return allSessions
    .filter(s => (s.student.id === 's1' || s.student.id === 's2') && s.dateStr.startsWith(month))
    .map(s => {
      const prog = getProgrammeById(s.programme.id)
      return {
        id: s.id,
        date: s.dateStr,
        displayTime: s.displayTime,
        displayDateTime: `${s.displayDate} · ${s.displayTime}`,
        programme: s.programme.name,
        mascot: prog.mascot,
        color: s.programme.color,
        category: prog.category,
        teacher: s.teacher.name,
        studentName: s.student.name,
        durationMin: s.durationMin,
        status: s.status,
      }
    })
}

export function getMockParentSlots(_programmeId: string, _duration: number, weekStart: string) {
  const monday = new Date(weekStart + 'T00:00:00')
  return {
    weekStart,
    slots: [
      { id: 'slot1', date: toDateStr(addDays(monday, 1)), displayDate: fmtDate(addDays(monday, 1)), displayTime: '10:00 AM', teacherName: 'Beverly Wong', teacherColor: '#F5C842', teacherId: 't1', available: true },
      { id: 'slot2', date: toDateStr(addDays(monday, 2)), displayDate: fmtDate(addDays(monday, 2)), displayTime: '2:00 PM',  teacherName: 'Beverly Wong', teacherColor: '#F5C842', teacherId: 't1', available: true },
      { id: 'slot3', date: toDateStr(addDays(monday, 3)), displayDate: fmtDate(addDays(monday, 3)), displayTime: '10:00 AM', teacherName: 'Gwen Torres',  teacherColor: '#06D6A0', teacherId: 't5', available: true },
      { id: 'slot4', date: toDateStr(addDays(monday, 4)), displayDate: fmtDate(addDays(monday, 4)), displayTime: '11:00 AM', teacherName: 'Beverly Wong', teacherColor: '#F5C842', teacherId: 't1', available: true },
      { id: 'slot5', date: toDateStr(addDays(monday, 5)), displayDate: fmtDate(addDays(monday, 5)), displayTime: '3:00 PM',  teacherName: 'Gwen Torres',  teacherColor: '#06D6A0', teacherId: 't5', available: false },
      { id: 'slot6', date: toDateStr(addDays(monday, 6)), displayDate: fmtDate(addDays(monday, 6)), displayTime: '10:00 AM', teacherName: 'Beverly Wong', teacherColor: '#F5C842', teacherId: 't1', available: true },
    ],
  }
}

export function getMockParentInvoices() {
  const all = getMockInvoices({ parentId: 'par1' })

  function monthLabel(periodStart: string) {
    const d = new Date(periodStart + 'T00:00:00')
    return d.toLocaleDateString('en-HK', { month: 'long', year: 'numeric' })
  }

  return all.map(inv => ({
    id: inv.id,
    month: monthLabel(inv.periodStart),
    total: inv.total,
    subtotal: inv.subtotal,
    discount: inv.discount,
    status: inv.status,
    dueDate: inv.dueDate,
    paidAt: inv.paidAt,
    items: inv.items.map(item => ({ id: item.id, description: item.description, amount: item.amount })),
  }))
}

export function getMockParentChildren() {
  const allSessions = getMockCalendarSessions()

  function sessionsForStudent(studentId: string, status: 'SCHEDULED' | 'COMPLETED', limit: number) {
    const filtered = allSessions.filter(s => s.student.id === studentId && s.status === status)
    const sliced = status === 'SCHEDULED' ? filtered.slice(0, limit) : filtered.slice(-limit)
    return sliced.map(s => ({
      id: s.id,
      displayDate: s.displayDate,
      programme: s.programme.name,
      mascot: getProgrammeById(s.programme.id).mascot,
      teacher: s.teacher.name,
      durationMin: s.durationMin,
      status: s.status,
    }))
  }

  const today = new Date()

  return [
    {
      id: 's1',
      name: 'Emma Chen',
      age: 8,
      enrollments: [{ programme: 'Math Explorers', mascot: '🦊', color: '#F5C842', category: 'MATHS', packageType: 'BUNDLE_12' }],
      nextClass: { displayDate: fmtDate(addDays(today, 2)), programme: 'Math Explorers', teacher: 'Beverly Wong' },
      upcomingSessions: sessionsForStudent('s1', 'SCHEDULED', 3),
      pastSessions: sessionsForStudent('s1', 'COMPLETED', 3),
    },
    {
      id: 's2',
      name: 'Oliver Lam',
      age: 6,
      enrollments: [{ programme: 'Reading Stars', mascot: '🦉', color: '#E8623A', category: 'LITERACY', packageType: 'MONTHLY' }],
      nextClass: { displayDate: fmtDate(addDays(today, 3)), programme: 'Reading Stars', teacher: 'Tristan Hall' },
      upcomingSessions: sessionsForStudent('s2', 'SCHEDULED', 3),
      pastSessions: sessionsForStudent('s2', 'COMPLETED', 3),
    },
  ]
}

// ─── Teacher Mock Data ────────────────────────────────────────────────────────

function toBeverlyWeekSession(s: CalendarSessionData) {
  const prog = getProgrammeById(s.programme.id)
  return {
    id: s.id,
    dateStr: s.dateStr,
    displayDate: s.displayDate,
    displayTime: s.displayTime,
    programme: s.programme.name,
    mascot: prog.mascot,
    color: s.programme.color,
    durationMin: s.durationMin,
    status: s.status,
    notes: null as null,
    studentFirstName: s.student.name.split(' ')[0],
  }
}

export function getMockTeacherDashboard() {
  const allSessions = getMockCalendarSessions()
  const today = new Date()
  const weekMonday = getMonday(today)
  const weekEnd = addDays(weekMonday, 6)
  const weekMondayStr = toDateStr(weekMonday)
  const weekEndStr = toDateStr(weekEnd)

  const weekSessions = allSessions
    .filter(s => s.teacher.id === 't1' && s.dateStr >= weekMondayStr && s.dateStr <= weekEndStr)
    .map(toBeverlyWeekSession)

  const totalSessions = weekSessions.length
  const totalHours = weekSessions.reduce((acc, s) => acc + s.durationMin / 60, 0)

  return {
    teacherName: 'Beverly Wong',
    color: '#F5C842',
    speciality: 'Mathematics',
    todayStr: toDateStr(today),
    weekSessions,
    thisWeekSummary: { totalSessions, totalHours },
    currentPeriodEarnings: 4900,
    currentPeriod: monthStr(today),
  }
}

export function getMockTeacherWeekSessions(weekStart: string) {
  const allSessions = getMockCalendarSessions()
  const monday = new Date(weekStart + 'T00:00:00')
  const weekEnd = toDateStr(addDays(monday, 6))

  const sessions = allSessions
    .filter(s => s.teacher.id === 't1' && s.dateStr >= weekStart && s.dateStr <= weekEnd)
    .map(toBeverlyWeekSession)

  return { weekStart, sessions }
}

export function getMockTeacherAvailability() {
  return {
    weeklyPattern: {
      MON: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
      TUE: ['14:00', '15:00', '16:00', '17:00'],
      WED: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
      THU: ['14:00', '15:00', '16:00', '17:00'],
      FRI: ['10:00', '11:00', '12:00', '13:00', '14:00'],
      SAT: ['10:00', '11:00', '12:00'],
    },
    exceptions: [] as { startDate: string; endDate: string; label?: string }[],
  }
}

export function getMockTeacherClasses(status: 'upcoming' | 'past') {
  const allSessions = getMockCalendarSessions()
  const sessStatus = status === 'upcoming' ? 'SCHEDULED' : 'COMPLETED'
  const filtered = allSessions.filter(s => s.teacher.id === 't1' && s.status === sessStatus)
  const sliced = status === 'upcoming' ? filtered.slice(0, 10) : filtered.slice(-10)

  return sliced.map(s => {
    const prog = getProgrammeById(s.programme.id)
    return {
      id: s.id,
      dateStr: s.dateStr,
      displayDate: s.displayDate,
      displayTime: s.displayTime,
      displayDateTime: `${s.displayDate} · ${s.displayTime}`,
      programme: s.programme.name,
      mascot: prog.mascot,
      color: s.programme.color,
      durationMin: s.durationMin,
      status: s.status,
      notes: null as null,
      studentFirstName: s.student.name.split(' ')[0],
    }
  })
}

export function getMockTeacherPayslips() {
  return [
    { id: 'ps1', period: 'February 2026', periodStart: '2026-02-01', periodEnd: '2026-02-28', grossAmount: 7700, status: 'CONFIRMED' },
    { id: 'ps2', period: 'March 2026',    periodStart: '2026-03-01', periodEnd: '2026-03-31', grossAmount: 8400, status: 'CONFIRMED' },
    { id: 'ps3', period: 'April 2026',    periodStart: '2026-04-01', periodEnd: '2026-04-30', grossAmount: 8400, status: 'DRAFT'     },
  ]
}

export function getMockTeacherPayslipDetail(_id?: string) {
  // Generate 24 items: 6 per week × 4 weeks (Mon/Wed/Fri Emma, Tue/Thu/Sat Lucas)
  const items = []
  const weeks = [
    { mon: '2026-04-07', tue: '2026-04-08', wed: '2026-04-09', thu: '2026-04-10', fri: '2026-04-11', sat: '2026-04-12' },
    { mon: '2026-04-14', tue: '2026-04-15', wed: '2026-04-16', thu: '2026-04-17', fri: '2026-04-18', sat: '2026-04-19' },
    { mon: '2026-04-21', tue: '2026-04-22', wed: '2026-04-23', thu: '2026-04-24', fri: '2026-04-25', sat: '2026-04-26' },
    { mon: '2026-04-28', tue: '2026-04-29', wed: '2026-04-30', thu: '2026-04-30', fri: '2026-04-30', sat: '2026-04-30' },
  ]
  let itemIdx = 1
  for (const week of weeks) {
    items.push({ id: `pitem${itemIdx++}`, date: week.mon, studentFirstName: 'Emma',  programme: 'Math Explorers', durationMin: 60, ratePerHour: 350, amount: 350 })
    items.push({ id: `pitem${itemIdx++}`, date: week.tue, studentFirstName: 'Lucas', programme: 'Math Explorers', durationMin: 60, ratePerHour: 350, amount: 350 })
    items.push({ id: `pitem${itemIdx++}`, date: week.wed, studentFirstName: 'Emma',  programme: 'Math Explorers', durationMin: 60, ratePerHour: 350, amount: 350 })
    items.push({ id: `pitem${itemIdx++}`, date: week.thu, studentFirstName: 'Lucas', programme: 'Math Explorers', durationMin: 60, ratePerHour: 350, amount: 350 })
    items.push({ id: `pitem${itemIdx++}`, date: week.fri, studentFirstName: 'Emma',  programme: 'Math Explorers', durationMin: 60, ratePerHour: 350, amount: 350 })
    items.push({ id: `pitem${itemIdx++}`, date: week.sat, studentFirstName: 'Lucas', programme: 'Math Explorers', durationMin: 60, ratePerHour: 350, amount: 350 })
  }

  return {
    id: 'ps3',
    period: 'April 2026',
    periodStart: '2026-04-01',
    periodEnd: '2026-04-30',
    grossAmount: 8400,
    status: 'DRAFT',
    totalSessions: 24,
    totalHours: 24,
    teacherName: 'Beverly Wong',
    speciality: 'Mathematics',
    ratePerHour: 350,
    items,
  }
}
