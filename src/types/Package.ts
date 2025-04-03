import type { DbPackage } from './supabase'

// Veritabanı tipini genişleten kredi paketi tipi
export interface Package extends DbPackage {
  // DbPackage'dan gelen temel özelliklere ek olarak frontend'de kullanılacak özellikler
  activeUsers?: number
  weeklySales?: number
  monthlySales?: number
  totalSales?: number
  recommendedFlag?: boolean
}

// Paket satın alma isteği için kullanılan tip
export interface PackagePurchaseRequest {
  packageId: string
  userId: string
  amount: number
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'other'
}

// Package response tipi 
export interface PackageResponse {
  success: boolean
  package?: Package
  error?: string
}

// Ön yüzde kullanılacak olan paket durumu
export type PackageStatus = 'active' | 'inactive' | 'expired' | 'upcoming'