import type { DbBooking } from './supabase'

// Veritabanı tipini genişleten rezervasyon tipi
export interface Booking extends DbBooking {
  // DbBooking'den gelen temel özelliklere ek olarak frontend'de kullanılacak özellikler
  teacher?: {
    name: string
    avatar?: string
  }
  student?: {
    name: string
    avatar?: string
  }
}

export type BookingStatus = 'active' | 'completed' | 'cancelled'

// Ders gösterimi için kullanılan tip
export interface Lesson {
  id: string
  student_id: string
  teacher_id: string
  booking_id: string
  startTime: string
  endTime: string
  status: BookingStatus
  meetLink: string
  studentName?: string
  teacherName?: string
}

// Rezervasyon isteği için kullanılan tip
export interface BookingRequest {
  teacherId: string
  date: Date
  startTime: string
}

// Rezervasyon için join tipi (Select'te kullanılabilir)
export interface BookingWithTeacher extends Booking {
  teacher: {
    id: string
    name: string
    avatar?: string
  }
}

export interface BookingWithStudent extends Booking {
  student: {
    id: string
    name: string
    avatar?: string
  }
}

export interface BookingFull extends BookingWithTeacher, BookingWithStudent {}