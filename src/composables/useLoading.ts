import { ref, readonly } from 'vue'
import errorHandler from './useErrorHandler'

// Yükleme durumlarını izlemek için bir kayıt
interface LoadingState {
  [key: string]: boolean
}

const loadingStates = ref<LoadingState>({})
const anyLoading = ref(false)

export function useLoading() {
  // Belirli bir işlem için yükleme durumunu ayarla
  const setLoading = (key: string, isLoading: boolean): void => {
    if (isLoading) {
      loadingStates.value[key] = true
    } else {
      delete loadingStates.value[key]
    }
    
    // Herhangi bir işlem yükleniyor mu?
    anyLoading.value = Object.keys(loadingStates.value).length > 0
  }
  
  // Bir işlem yükleniyor mu kontrolü
  const isLoading = (key: string): boolean => {
    return !!loadingStates.value[key]
  }
  
  // Async işlemi yükleme durumu ile sarmalama
  const withLoading = async <T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T | null> => {
    setLoading(key, true)
    
    try {
      return await fn()
    } catch (error) {
      errorHandler.handleError(error, `loading: ${key}`)
      return null
    } finally {
      setLoading(key, false)
    }
  }
  
  return {
    // State
    loadingStates: readonly(loadingStates),
    anyLoading: readonly(anyLoading),
    
    // Methods
    setLoading,
    isLoading,
    withLoading
  }
}

// Singleton örneği oluştur
const globalLoading = useLoading()
export default globalLoading