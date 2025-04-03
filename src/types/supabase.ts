export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'teacher' | 'student'
          status: 'active' | 'inactive'
          credits?: number
          avatar?: string
          created_at: string
        }
        Insert: {
          email: string
          name: string
          role: 'admin' | 'teacher' | 'student'
          status?: 'active' | 'inactive'
          credits?: number
          avatar?: string
        }
        Update: {
          email?: string
          name?: string
          role?: 'admin' | 'teacher' | 'student'
          status?: 'active' | 'inactive'
          credits?: number
          avatar?: string
        }
      }
      slots: {
        Row: {
          id: string
          teacher_id: string
          date: string
          start_time: string
          is_booked: boolean
          created_at: string
        }
        Insert: {
          teacher_id: string
          date: string
          start_time: string
          is_booked?: boolean
        }
        Update: {
          teacher_id?: string
          date?: string
          start_time?: string
          is_booked?: boolean
        }
      }
      bookings: {
        Row: {
          id: string
          student_id: string
          teacher_id: string
          slot_id: string
          meet_link: string
          status: 'active' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          student_id: string
          teacher_id: string
          slot_id: string
          meet_link: string
          status?: 'active' | 'completed' | 'cancelled'
        }
        Update: {
          student_id?: string
          teacher_id?: string
          slot_id?: string
          meet_link?: string
          status?: 'active' | 'completed' | 'cancelled'
        }
      }
    }
  }
}

// Database Types
export type DbUser = Database['public']['Tables']['users']['Row']
export type DbSlot = Database['public']['Tables']['slots']['Row']
export type DbBooking = Database['public']['Tables']['bookings']['Row']

// Insert Types
export type DbUserInsert = Database['public']['Tables']['users']['Insert']
export type DbSlotInsert = Database['public']['Tables']['slots']['Insert']
export type DbBookingInsert = Database['public']['Tables']['bookings']['Insert']

// Update Types
export type DbUserUpdate = Database['public']['Tables']['users']['Update']
export type DbSlotUpdate = Database['public']['Tables']['slots']['Update']
export type DbBookingUpdate = Database['public']['Tables']['bookings']['Update']

// Extended Types with Relations
export interface BookingWithTeacher extends DbBooking {
  teacher: Pick<DbUser, 'id' | 'name' | 'avatar'>
}

export interface BookingWithStudent extends DbBooking {
  student: Pick<DbUser, 'id' | 'name' | 'avatar'>
}

export interface BookingFull extends BookingWithTeacher, BookingWithStudent {}