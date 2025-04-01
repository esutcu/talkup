export interface Slot {
    id: string
    teacher_id: string
    date: string
    startTime: string
    endTime?: string
    isAvailable: boolean
    isBooked?: boolean
    bookingId?: string
    studentName?: string
    created_at?: string
    updated_at?: string
  }
  
  export interface AvailabilitySlot {
    date: string
    startTime: string
    endTime: string
    teacherId?: string
  }
  
  export interface TeacherSlotRequest {
    date: string
    timeSlots: string[]
    teacherId: string
  }