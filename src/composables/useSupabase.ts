import { ref } from 'vue'
import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js'

// Supabase konfigürasyon bilgileri
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Singleton pattern için supabase client'ı
let supabaseInstance: SupabaseClient | null = null

export function useSupabase() {
  const error = ref<PostgrestError | null>(null)
  const loading = ref(false)

  // Supabase client'ı oluştur veya mevcut olanı döndür
  const getSupabaseClient = (): SupabaseClient => {
    if (supabaseInstance) return supabaseInstance

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase konfigürasyonu eksik. VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY env değişkenlerini kontrol edin.')
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey)
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