import { ref, computed } from 'vue'
import { useSupabase } from './useSupabase'
import type { CreditTransaction } from '@/types/Credit'

export function useCredits() {
  const { supabase } = useSupabase()
  
  // State
  const balance = ref(0)
  const transactions = ref<CreditTransaction[]>([])
  const isLoading = ref(false)

  // Computed
  const hasEnoughCredits = computed(() => balance.value >= 1)

  // Methods
  const fetchBalance = async (userId: string) => {
    isLoading.value = true
    
    const { data, error } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single()

    if (data && !error) {
      balance.value = data.credits
    }
    
    isLoading.value = false
    return balance.value
  }

  const fetchTransactions = async (userId: string) => {
    isLoading.value = true
    
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

    if (data && !error) {
      transactions.value = data
    }
    
    isLoading.value = false
    return transactions.value
  }

  const useCredit = async (userId: string) => {
    if (!hasEnoughCredits.value) {
      throw new Error('Yetersiz kredi')
    }

    const { error } = await supabase
      .from('users')
      .update({ credits: balance.value - 1 })
      .eq('id', userId)

    if (!error) {
      // Kredi kullanım kaydı oluştur
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: -1,
          type: 'use',
          description: 'Ders rezervasyonu için kredi kullanıldı'
        })

      balance.value -= 1
      return true
    }

    return false
  }

  const refundCredit = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .update({ credits: balance.value + 1 })
      .eq('id', userId)

    if (!error) {
      // Kredi iade kaydı oluştur
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: 1,
          type: 'refund',
          description: 'İptal edilen ders için kredi iadesi'
        })

      balance.value += 1
      return true
    }

    return false
  }

  const purchaseCredits = async (userId: string, packageId: string) => {
    // Önce paketi kontrol et
    const { data: packageData } = await supabase
      .from('packages')
      .select('credit_amount, price')
      .eq('id', packageId)
      .single()

    if (!packageData) return false

    // Kredi satın alma işlemi
    const { error } = await supabase
      .from('users')
      .update({ credits: balance.value + packageData.credit_amount })
      .eq('id', userId)

    if (!error) {
      // Satın alma kaydı oluştur
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          package_id: packageId,
          amount: packageData.credit_amount,
          type: 'purchase',
          description: 'Kredi paketi satın alındı',
          price: packageData.price
        })

      balance.value += packageData.credit_amount
      return true
    }

    return false
  }

  const formatTransaction = (transaction: CreditTransaction) => {
    const types = {
      purchase: 'Satın Alma',
      use: 'Kullanım',
      refund: 'İade'
    }

    const getColor = (type: string) => {
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
    
    // Methods
    fetchBalance,
    fetchTransactions,
    useCredit,
    refundCredit,
    purchaseCredits,
    formatTransaction
  }
}