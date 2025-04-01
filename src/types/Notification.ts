import type { DbNotification } from './supabase'

// Veritabanı tipini genişleten bildirim tipi
export interface Notification extends DbNotification {
  // DbNotification'dan gelen temel özelliklere ek olarak frontend'de kullanılacak özellikler
}

// Bildirim türleri
export type NotificationType = 
  | 'payment_success'
  | 'payment_failed'
  | 'credit_added'
  | 'credit_refunded'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'reminder'
  | 'system'

// Bildirim filtreleme seçenekleri
export interface NotificationFilters {
  isRead?: boolean
  types?: NotificationType[]
  fromDate?: Date
  toDate?: Date
}

// Bildirim özeti tipi
export interface NotificationSummary {
  totalCount: number
  unreadCount: number
  lastNotification?: Notification
}

// Bildirim grubu tipi
export interface NotificationGroup {
  date: string
  notifications: Notification[]
}