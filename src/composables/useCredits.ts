import { ref, computed } from 'vue'
import { useSupabase } from './useSupabase'
import type { CreditTransaction, CreditPackage, FormattedCreditTransaction, CreditSummary } from '@/types/Credit'
import type { DbCreditTransactionInsert } from '@/types/supabase'
import errorHandler from './useErrorHandler'

export function useCredits() {
  const { supabase } = useSupabase()
  
  // State
  const balance = ref<number>(0)
  const transactions = ref<CreditTransaction[]>([])
  const isLoading = ref<boolean>(false)

  // Computed
  const hasEnoughCredits = computed<boolean>(() => balance.value >= 1)
  
  const summary = computed<CreditSummary>(() => {
    const purchased = transactions.value
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0)
      
    const used = transactions.value
      .filter(t => t.type === 'use')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
    const refunded = transactions.value
      .filter(t => t.type === 'refund')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const lastTransaction = transactions.value[0]
    
    return {
      totalPurchased: purchased,
      totalUsed: used,
      totalRefunded: refunded,
      balance: balance.value,
      lastTransaction
    }
  })

  // Methods
  const fetchBalance = async (userId: string): Promise<number> => {
    isLoading.value = true
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single()

      if (error) throw error
      
      if (data) {
        balance.value = data.credits
      }
      
      return balance.value
    } catch (err) {
      errorHandler.handleError(err, 'fetchBalance')
      return 0
    } finally {
      isLoading.value = false
    }
  }

  const fetchTransactions = async (userId: string): Promise<CreditTransaction[]> => {
    isLoading.value = true
    
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select(`
          *,
          package:package_id (
            name,
            credit_amount
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      if (data) {
        transactions.value = data as CreditTransaction[]
      }
      
      return transactions.value
    } catch (err) {
      errorHandler.handleError(err, 'fetchTransactions')
      return []
    } finally {
      isLoading.value = false
    }
  }

  const useCredit = async (userId: string): Promise<boolean> => {
    if (!hasEnoughCredits.value) {
      throw new Error('Yetersiz kredi')
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ credits: balance.value - 1 })
        .eq('id', userId)

      if (error) throw error

      // Kredi kullanım kaydı oluştur
      const transaction: DbCreditTransactionInsert = {
        user_id: userId,
        amount: -1,
        type: 'use',
        description: 'Ders rezervasyonu için kredi kullanıldı'
      }
      
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert(transaction)
        
      if (transactionError) throw transactionError

      balance.value -= 1
      return true
    } catch (err) {
      errorHandler.handleError(err, 'useCredit')
      return false
    }
  }

  const refundCredit = async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ credits: balance.value + 1 })
        .eq('id', userId)

      if (error) throw error

      // Kredi iade kaydı oluştur
      const transaction: DbCreditTransactionInsert = {
        user_id: userId,
        amount: 1,
        type: 'refund',
        description: 'İptal edilen ders için kredi iadesi'
      }
      
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert(transaction)
        
      if (transactionError) throw transactionError

      balance.value += 1
      return true
    } catch (err) {
      errorHandler.handleError(err, 'refundCredit')
      return false
    }
  }

  const purchaseCredits = async (userId: string, packageId: string): Promise<boolean> => {
    try {
      // Önce paketi kontrol et
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('credit_amount, price')
        .eq('id', packageId)
        .single()

      if (packageError) throw packageError
      if (!packageData) return false

      // Kredi satın alma işlemi
      const { error } = await supabase
        .from('users')
        .update({ credits: balance.value + packageData.credit_amount })
        .eq('id', userId)

      if (error) throw error

      // Satın alma kaydı oluştur
      const transaction: DbCreditTransactionInsert = {
        user_id: userId,
        package_id: packageId,
        amount: packageData.credit_amount,
        type: 'purchase',
        description: 'Kredi paketi satın alındı',
        price: packageData.price
      }
      
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert(transaction)
        
      if (transactionError) throw transactionError

      balance.value += packageData.credit_amount
      return true
    } catch (err) {
      errorHandler.handleError(err, 'purchaseCredits')
      return false
    }
  }

  const formatTransaction = (transaction: CreditTransaction): FormattedCreditTransaction => {
    const types = {
      purchase: 'Satın Alma',
      use: 'Kullanım',
      refund: 'İade'
    }

    const getColor = (type: string): string => {
      switch (type) {
        case 'purchase':
          return 'text-green-600'
        case 'use':
          return 'text-blue-600'
        case 'refund':
          return 'text-orange-600'
        default:
          return 'text-gray-600'
      }
    }

    return {
      ...transaction,
      typeText: types[transaction.type],
      color: getColor(transaction.type),
      isPositive: ['purchase', 'refund'].includes(transaction.type)
    }
  }

  return {
    // State
    balance,
    transactions,
    isLoading,
    
    // Computed
    hasEnoughCredits,
    summary,
    
    // Methods
    fetchBalance,
    fetchTransactions,
    useCredit,
    refundCredit,
    purchaseCredits,
    formatTransaction
  }
}