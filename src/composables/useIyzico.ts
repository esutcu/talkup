import { ref } from 'vue'
import { useSupabase } from './useSupabase'
import { env } from '@/utils/environment'
import type { PaymentOptions, PaymentResult } from '@/types/Payment'

export function useIyzico() {
  const { supabase } = useSupabase()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const initializePayment = async (options: PaymentOptions): Promise<PaymentResult> => {
    isLoading.value = true
    error.value = null

    try {
      // Supabase Edge Function'ı çağır
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'initialize-payment',
        {
          body: {
            packageId: options.packageId,
            userId: options.userId,
            price: options.price,
            paidPrice: options.paidPrice
          }
        }
      )

      if (paymentError) throw paymentError

      // Iyzico scripti yükle
      await loadIyzicoScript()

      // Iyzico formunu aç
      return new Promise((resolve) => {
        window.IyzipayCheckout.open({
          ...paymentData,
          callback: (result: any) => {
            if (result.status === 'success') {
              completePayment(result.token, options)
                .then(() => resolve({ success: true }))
                .catch((err) => {
                  error.value = 'Ödeme tamamlanamadı'
                  resolve({ success: false, error: err })
                })
            } else {
              error.value = 'Ödeme başarısız'
              resolve({ success: false, error: result })
            }
          }
        })
      })

    } catch (err) {
      error.value = 'Ödeme başlatılamadı'
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  const completePayment = async (token: string, options: PaymentOptions) => {
    const { error: completionError } = await supabase.functions.invoke(
      'complete-payment',
      {
        body: {
          token,
          packageId: options.packageId,
          userId: options.userId
        }
      }
    )

    if (completionError) throw completionError
  }

  const loadIyzicoScript = async (): Promise<void> => {
    if (window.IyzipayCheckout) return

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://static.iyzipay.com/checkoutform/v2/bundle.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Iyzico script yüklenemedi'))
      document.head.appendChild(script)
    })
  }

  return {
    initializePayment,
    isLoading,
    error
  }
}