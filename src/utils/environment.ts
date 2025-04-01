/**
 * Ortam değişkenlerini güvenli bir şekilde almak için kullanılan yardımcı fonksiyonlar
 */

// Zorunlu ortam değişkenlerini kontrol eden fonksiyon
export function validateRequiredEnvVars() {
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ]
  
    const missingVars = requiredVars.filter(
      varName => !import.meta.env[varName]
    )
  
    if (missingVars.length > 0) {
      throw new Error(
        `Eksik ortam değişkenleri: ${missingVars.join(', ')}. ` +
        'Lütfen .env dosyasını doğru şekilde yapılandırın.'
      )
    }
  }
  
  // Type-safe şekilde ortam değişkenlerine erişim için bir nesne
  export const env = {
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    google: {
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    },
    app: {
      publicUrl: import.meta.env.VITE_PUBLIC_URL || '',
    },
    payment: {
      iyzipayApiKey: import.meta.env.VITE_IYZIPAY_API_KEY || '',
      iyzipaySecretKey: import.meta.env.VITE_IYZIPAY_SECRET_KEY || '',
      iyzipayBaseUrl: import.meta.env.VITE_IYZIPAY_BASE_URL || '',
    },
    // Aygıt durumlarına göre özelleştirme
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  }
  
  // Ortam değişkenlerini kontrol et
  export function checkEnvironment() {
    try {
      validateRequiredEnvVars()
      return true
    } catch (error) {
      console.error('Ortam değişkeni hatası:', error.message)
      return false
    }
  }