import { ref } from 'vue'
import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Singleton pattern için supabase client'ı
let supabaseInstance: SupabaseClient<Database> | null = null

export function useSupabase() {
  const error = ref<PostgrestError | null>(null)
  const loading = ref(false)

  // Supabase client'ı oluştur veya mevcut olanı döndür
  const getSupabaseClient = (): SupabaseClient<Database> => {
    if (supabaseInstance) return supabaseInstance

    try {
      supabaseInstance = createClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          }
        }
      )
      return supabaseInstance
    } catch (err) {
      console.error('Supabase client creation error:', err)
      throw new Error('Failed to initialize Supabase client')
    }
  }

  // Supabase client instance'ını döndür
  const supabase = getSupabaseClient()

  return {
    supabase,
    error,
    loading
  }
}