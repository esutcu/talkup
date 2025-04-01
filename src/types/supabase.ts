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
          surname: string | null
          role: 'admin' | 'teacher' | 'student'
          status: 'active' | 'inactive' | 'suspended'
          avatar: string | null
          credits: number | null
          bio: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          name: string
          surname?: string | null
          role: 'admin' | 'teacher' | 'student'
          status?: 'active' | 'inactive' | 'suspended'
          avatar?: string | null
          credits?: number | null
          bio?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          surname?: string | null
          role?: 'admin' | 'teacher' | 'student'
          status?: 'active' | 'inactive' | 'suspended'
          avatar?: string | null
          credits?: number | null
          bio?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      
      slots: {
        Row: {
          id: string
          teacher_id: string
          date: string
          start_time: string
          end_time: string | null
          is_available: boolean
          booking_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          teacher_id: string
          date: string
          start_time: string
          end_time?: string | null
          is_available?: boolean
          booking_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          teacher_id?: string
          date?: string
          start_time?: string
          end_time?: string | null
          is_available?: boolean
          booking_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      
      bookings: {
        Row: {
          id: string
          student_id: string
          teacher_id: string
          date: string
          start_time: string
          end_time: string | null
          status: 'active' | 'completed' | 'cancelled'
          meet_link: string
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          teacher_id: string
          date: string
          start_time: string
          end_time?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          meet_link: string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          teacher_id?: string
          date?: string
          start_time?: string
          end_time?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          meet_link?: string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      
      packages: {
        Row: {
          id: string
          name: string
          credit_amount: number
          price: number
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          credit_amount: number
          price: number
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          credit_amount?: number
          price?: number
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          package_id: string | null
          amount: number
          type: 'purchase' | 'use' | 'refund'
          description: string | null
          price: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          package_id?: string | null
          amount: number
          type: 'purchase' | 'use' | 'refund'
          description?: string | null
          price?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          package_id?: string | null
          amount?: number
          type?: 'purchase' | 'use' | 'refund'
          description?: string | null
          price?: number | null
          created_at?: string
        }
      }
      
      payment_transactions: {
        Row: {
          id: string
          user_id: string
          package_id: string
          amount: number
          currency: string
          conversation_id: string
          payment_id: string | null
          status: 'pending' | 'completed' | 'failed' | 'init_failed'
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          package_id: string
          amount: number
          currency: string
          conversation_id: string
          payment_id?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'init_failed'
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          package_id?: string
          amount?: number
          currency?: string
          conversation_id?: string
          payment_id?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'init_failed'
          created_at?: string
          updated_at?: string | null
        }
      }
      
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Spesifik tablo türlerini doğrudan erişim için dışa aktar
export type DbUser = Database['public']['Tables']['users']['Row']
export type DbSlot = Database['public']['Tables']['slots']['Row']
export type DbBooking = Database['public']['Tables']['bookings']['Row']
export type DbPackage = Database['public']['Tables']['packages']['Row']
export type DbCreditTransaction = Database['public']['Tables']['credit_transactions']['Row']
export type DbPaymentTransaction = Database['public']['Tables']['payment_transactions']['Row']
export type DbNotification = Database['public']['Tables']['notifications']['Row']

// Insert türleri
export type DbUserInsert = Database['public']['Tables']['users']['Insert']
export type DbSlotInsert = Database['public']['Tables']['slots']['Insert']
export type DbBookingInsert = Database['public']['Tables']['bookings']['Insert']
export type DbPackageInsert = Database['public']['Tables']['packages']['Insert']
export type DbCreditTransactionInsert = Database['public']['Tables']['credit_transactions']['Insert']
export type DbPaymentTransactionInsert = Database['public']['Tables']['payment_transactions']['Insert']
export type DbNotificationInsert = Database['public']['Tables']['notifications']['Insert']

// Update türleri
export type DbUserUpdate = Database['public']['Tables']['users']['Update']
export type DbSlotUpdate = Database['public']['Tables']['slots']['Update']
export type DbBookingUpdate = Database['public']['Tables']['bookings']['Update']
export type DbPackageUpdate = Database['public']['Tables']['packages']['Update']
export type DbCreditTransactionUpdate = Database['public']['Tables']['credit_transactions']['Update']
export type DbPaymentTransactionUpdate = Database['public']['Tables']['payment_transactions']['Update']
export type DbNotificationUpdate = Database['public']['Tables']['notifications']['Update']