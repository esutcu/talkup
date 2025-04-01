import type { DbCreditTransaction, DbPackage } from './supabase'

// Veritabanı tipini genişleten kredi işlem tipi
export interface CreditTransaction extends DbCreditTransaction {
  // DbCreditTransaction'dan gelen temel özelliklere ek olarak frontend'de kullanılacak özellikler
  package?: {
    name: string
    credit_amount: number
  }
}

// Veritabanı tipini genişleten kredi paketi tipi
export interface CreditPackage extends DbPackage {
  // DbPackage'dan gelen temel özelliklere ek olarak frontend'de kullanılacak özellikler
  total_sales?: number
  activeUsers?: number
  weeklySales?: number
}

// Kredi işlemi için özet tipi
export interface CreditSummary {
  totalPurchased: number
  totalUsed: number
  totalRefunded: number
  balance: number
  lastTransaction?: CreditTransaction
}

// Kredi işlem bilgisi için formatlı tip
export interface FormattedCreditTransaction extends CreditTransaction {
  typeText: string
  color: string
  isPositive: boolean
}