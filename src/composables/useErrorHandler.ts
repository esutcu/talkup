import { ref, readonly } from 'vue'
import { env } from '@/utils/environment'

// Global hata durumu
const lastError = ref<Error | null>(null)
const hasError = ref(false)

export function useErrorHandler() {
  // Hata yakalama ve işleme fonksiyonu
  const handleError = (error: Error | unknown, context?: string): void => {
    const message = error instanceof Error ? error.message : String(error)
    
    // Hata bilgisini güncelle
    lastError.value = error instanceof Error ? error : new Error(message)
    hasError.value = true
    
    // Geliştirme modunda konsolda ayrıntılı göster
    if (env.isDevelopment) {
      console.error(`[Error${context ? ': ' + context : ''}]`, error)
    } else {
      // Üretim modunda sadece hata mesajını göster
      console.error(`[Error${context ? ': ' + context : ''}]`, message)
    }
    
    // Burada ek olarak hata izleme hizmeti entegrasyonu (Sentry gibi) olabilir
  }
  
  // Hata durumunu temizle
  const clearError = (): void => {
    lastError.value = null
    hasError.value = false
  }
  
  // Async işlem sarmalayıcısı
  const wrapAsync = async <T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    clearError()
    
    try {
      return await fn()
    } catch (error) {
      handleError(error, context)
      return null
    }
  }
  
  // İşlev sarmalayıcısı
  const wrapFunction = <T extends (...args: any[]) => any>(
    fn: T,
    context?: string
  ): ((...args: Parameters<T>) => ReturnType<T> | null) => {
    return (...args: Parameters<T>): ReturnType<T> | null => {
      try {
        return fn(...args)
      } catch (error) {
        handleError(error, context)
        return null
      }
    }
  }
  
  // Kullanıcı dostu hata mesajı oluştur
  const getUserFriendlyMessage = (defaultMessage = 'Bir hata oluştu'): string => {
    if (!lastError.value) return defaultMessage
    
    // Burada hata türüne göre özelleştirilmiş kullanıcı dostu mesajlar oluşturabilirsiniz
    if (lastError.value.message.includes('network')) {
      return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin'
    }
    
    if (lastError.value.message.includes('permission')) {
      return 'Bu işlemi gerçekleştirmek için yetkiniz yok'
    }
    
    // Geliştirme modunda orijinal hatayı göster
    if (env.isDevelopment) {
      return lastError.value.message
    }
    
    // Üretim modunda genel bir mesaj göster
    return defaultMessage
  }
  
  return {
    // State
    error: readonly(lastError),
    hasError: readonly(hasError),
    
    // Methods
    handleError,
    clearError,
    wrapAsync,
    wrapFunction,
    getUserFriendlyMessage
  }
}

// Singleton örneği oluştur
const globalErrorHandler = useErrorHandler()

// Global hata yakalayıcısı
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    globalErrorHandler.handleError(event.error || new Error(event.message), 'global')
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    globalErrorHandler.handleError(event.reason, 'promise')
  })
}

export default globalErrorHandler