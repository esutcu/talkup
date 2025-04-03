// Rapor türleri
export type ReportType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

// Rapor veri kategorileri
export type ReportDataCategory = 'sales' | 'credits' | 'bookings' | 'users' | 'packages'

// Temel rapor verisi
export interface ReportData {
  label: string
  value: number
}

// Serileştirilmiş rapor verisi (grafikler için)
export interface SeriesData extends ReportData {
  category?: string
  date?: string
  color?: string
}

// Trend verisi (değişim oranları için)
export interface TrendData {
  current: number
  previous: number
  change: number
  percentChange: number
}

// Satış raporu arayüzü
export interface SalesReport {
  period: ReportType
  startDate: string
  endDate: string
  totalSales: number
  totalTransactions: number
  averageSale: number
  salesByDate: SeriesData[]
  salesByPackage: SeriesData[]
  trends: {
    sales: TrendData
    transactions: TrendData
    average: TrendData
  }
}

// Kredi raporu arayüzü
export interface CreditsReport {
  period: ReportType
  startDate: string
  endDate: string
  creditsSold: number
  creditsUsed: number
  creditsRefunded: number
  netCredits: number
  creditsByDate: SeriesData[]
  creditsByType: SeriesData[]
  trends: {
    sold: TrendData
    used: TrendData
    refunded: TrendData
  }
}

// Rezervasyon raporu arayüzü
export interface BookingsReport {
  period: ReportType
  startDate: string
  endDate: string
  totalBookings: number
  completedBookings: number
  cancelledBookings: number
  cancelRate: number
  bookingsByDate: SeriesData[]
  bookingsByStatus: SeriesData[]
  bookingsByTeacher: SeriesData[]
  bookingsByStudent: SeriesData[]
  trends: {
    total: TrendData
    completed: TrendData
    cancelled: TrendData
  }
}

// Kullanıcı raporu arayüzü
export interface UsersReport {
  period: ReportType
  startDate: string
  endDate: string
  newUsers: number
  activeUsers: number
  usersByDate: SeriesData[]
  usersByRole: SeriesData[]
  usersByStatus: SeriesData[]
  trends: {
    new: TrendData
    active: TrendData
  }
}

// Rapor için filtreler
export interface ReportFilters {
  startDate?: string
  endDate?: string
  period?: ReportType
  teacherId?: string
  studentId?: string
  packageId?: string
  status?: string
}

// Toplu rapor (Dashboard için)
export interface DashboardReport {
  sales: {
    total: number
    trend: number
  }
  credits: {
    sold: number
    used: number
    trend: number
  }
  bookings: {
    total: number
    completed: number
    cancelled: number
    trend: number
  }
  users: {
    total: number
    new: number
    trend: number
  }
  recentTransactions: any[]
  topTeachers: any[]
  topPackages: any[]
}