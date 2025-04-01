import type { DbUser } from './supabase'

// Temel kullanıcı tipi
export interface User extends DbUser {
  // DbUser'dan gelen temel özelliklere ek olarak frontend'de kullanılacak özellikler
}

// Öğretmen tipi 
export interface Teacher extends User {
  role: 'teacher'
  availability?: TeacherAvailability[]
  rating?: number
  lessonCount?: number
  nextAvailableSlots?: string[]
  slots?: TeacherSlot[]
}

// Öğrenci tipi
export interface Student extends User {
  role: 'student'
  credits: number
}

// Öğretmen müsaitliği için yardımcı tipler
export interface TeacherAvailability {
  day: number // 0: Pazar, 1: Pazartesi, ... 6: Cumartesi
  startTime: string
  endTime: string
}

export interface TeacherSlot {
  id: string
  teacher_id: string
  date: string
  start_time: string
  end_time?: string
  is_available: boolean
  booking_id?: string
  created_at: string
}