import { ref } from 'vue'
import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js'
import { env, checkEnvironment } from '@/utils/environment'
import type { Database } from '@/types/supabase'

// Singleton pattern için supabase client'ı
let supabaseInstance: SupabaseClient<Database> | null = null

export function useSupabase() {
  const error = ref<PostgrestError | null>(null)
  const loading = ref(false)

  // Supabase client'ı oluştur veya mevcut olanı döndür
  const getSupabaseClient = (): SupabaseClient<Database> => {
    if (supabaseInstance) return supabaseInstance

    // Çevre değişkenlerini kontrol et
    const isEnvironmentValid = checkEnvironment()
    if (!isEnvironmentValid) {
      throw new Error('Supabase konfigürasyonu eksik. .env dosyasını kontrol edin.')
    }

    supabaseInstance = createClient<Database>(env.supabase.url, env.supabase.anonKey)
    return supabaseInstance
  }

  // Supabase client instance'ını döndür
  const supabase = getSupabaseClient()

  return {
    supabase,
    error,
    loading
  }
}