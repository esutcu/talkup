export interface PaymentOptions {
  packageId: string
  userId: string
  price: number
  paidPrice: number
}

export interface PaymentResult {
  success: boolean
  error?: any
}

export interface PaymentTransaction {
  id: string
  user_id: string
  package_id: string
  amount: number
  currency: string
  payment_id: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}