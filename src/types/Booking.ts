export interface Booking {
    id: string
    student_id: string
    teacher_id: string
    date: string
    start_time: string
    end_time?: string
    status: BookingStatus
    meet_link: string
    notes?: string
    created_at: string
    updated_at?: string
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
  
  export interface Lesson {
    id: string
    student_id: string
    teacher_id: string
    booking_id: string
    startTime: string
    endTime: string
    status: 'active' | 'completed' | 'cancelled'
    meetLink: string
    studentName?: string
    teacherName?: string
  }
  
  export interface BookingRequest {
    teacherId: string
    date: Date
    startTime: string
  }