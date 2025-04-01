import type { DbSlot } from './supabase'

// Veritabanı tipini genişleten slot tipi
export interface Slot extends Omit<DbSlot, 'start_time' | 'end_time'> {
  startTime: string
  endTime?: string
  isAvailable: boolean
  isBooked?: boolean
  studentName?: string
}

// Frontend'de kullanılan müsaitlik slotu
export interface AvailabilitySlot {
  date: string
  startTime: string
  endTime: string
  teacherId?: string
}

// Öğretmen slot isteği için kullanılan tip
export interface TeacherSlotRequest {
  date: string
  timeSlots: string[]
  teacherId: string
}

// Slot için join tipi (Select'te kullanılabilir)
export interface SlotWithTeacher extends Slot {
  teacher: {
    id: string
    name: string
    avatar?: string
  }
}

export interface SlotWithBooking extends Slot {
  booking?: {
    id: string
    student_id: string
    status: string
    meet_link: string
  }
}