import { ref, readonly } from 'vue'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number
  visible: boolean
}

const toasts = ref<Toast[]>([])
let toastCounter = 0

export function useToast() {
  // Toast oluştur
  const show = (
    message: string,
    type: ToastType = 'info',
    duration: number = 3000
  ): number => {
    const id = ++toastCounter
    
    const toast: Toast = {
      id,
      message,
      type,
      duration,
      visible: true
    }
    
    toasts.value.push(toast)
    
    // Otomatik kapatma için zamanlayıcı ayarla
    if (duration > 0) {
      setTimeout(() => {
        close(id)
      }, duration)
    }
    
    return id
  }
  
  // Belirli bir toast'u kapat
  const close = (id: number): void => {
    const toastIndex = toasts.value.findIndex(t => t.id === id)
    
    if (toastIndex !== -1) {
      toasts.value[toastIndex].visible = false
      
      // Animasyon tamamlandıktan sonra toasts dizisinden kaldır
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 300)
    }
  }
  
  // Tüm toast'ları kapat
  const closeAll = (): void => {
    toasts.value.forEach(toast => {
      close(toast.id)
    })
  }
  
  // Helper metodlar
  const success = (message: string, duration: number = 3000): number => {
    return show(message, 'success', duration)
  }
  
  const error = (message: string, duration: number = 4000): number => {
    return show(message, 'error', duration)
  }
  
  const info = (message: string, duration: number = 3000): number => {
    return show(message, 'info', duration)
  }
  
  const warning = (message: string, duration: number = 3500): number => {
    return show(message, 'warning', duration)
  }
  
  return {
    // State
    toasts: readonly(toasts),
    
    // Methods
    show,
    close,
    closeAll,
    success,
    error,
    info,
    warning
  }
}

// Singleton örneği oluştur
const globalToast = useToast()
export default globalToast