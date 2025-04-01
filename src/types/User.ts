export interface User {
    id: string
    email: string
    name: string
    surname?: string
    role: 'admin' | 'teacher' | 'student'
    status: 'active' | 'inactive' | 'suspended'
    avatar?: string
    credits?: number
    bio?: string
    created_at: string
    updated_at?: string
  }
  
  export interface Teacher extends User {
    role: 'teacher'
    availability?: TeacherAvailability[]
    rating?: number
    lessonCount?: number
    nextAvailableSlots?: string[]
    slots?: TeacherSlot[]
  }
  
  export interface Student extends User {
    role: 'student'
    credits: number
  }
  
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