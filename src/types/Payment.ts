import type { DbPaymentTransaction } from './supabase'

// Ödeme başlatma seçenekleri tipi
export interface PaymentOptions {
  packageId: string
  userId: string
  price: number
  paidPrice: number
}

// Ödeme sonucu tipi
export interface PaymentResult {
  success: boolean
  error?: any
  token?: string
  paymentId?: string
}

// Veritabanı tipini genişleten ödeme işlemi tipi
export interface PaymentTransaction extends DbPaymentTransaction {
  // DbPaymentTransaction'dan gelen temel özelliklere ek olarak frontend'de kullanılacak özellikler
  package?: {
    name: string
    credit_amount: number
  }
  user?: {
    name: string
    email: string
  }
}

// Iyzico sonuç tipi
export interface IyzicoCallbackResult {
  status: string
  token: string
  conversationId: string
  paymentId?: string
  errorCode?: string
  errorMessage?: string
  errorGroup?: string
}

// Ödeme özeti tipi
export interface PaymentSummary {
  totalAmount: number
  successfulCount: number
  failedCount: number
  pendingCount: number
  lastTransaction?: PaymentTransaction
}