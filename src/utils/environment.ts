// Ortam değişkenlerine güvenli erişim
export const env = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  app: {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  }
}

// Temel kontrol
export function checkEnvironment(): boolean {
  if (!env.supabase.url || !env.supabase.anonKey) {
    console.error('Eksik ortam değişkenleri. .env dosyasını kontrol edin.')
    return false
  }
  return true
}