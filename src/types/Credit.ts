
export interface CreditTransaction {
  id: string
  user_id: string
  package_id?: string
  amount: number
  type: 'purchase' | 'use' | 'refund'
  description: string
  price?: number
  created_at: string
  package?: {
    name: string
    credit_amount: number
  }
}

export interface CreditPackage {
  id: string
  name: string
  credit_amount: number
  price: number
  description?: string
  is_active: boolean
  created_at: string
}