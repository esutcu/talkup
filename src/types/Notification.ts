export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export type NotificationType = 
  | 'payment_success'
  | 'payment_failed'
  | 'credit_added'
  | 'credit_refunded'
  | 'booking_confirmed'
  | 'booking_cancelled'