// src/utils/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase' // varsa types'ı entegre et

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Supabase environment variables eksik! .env dosyasını kontrol et.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
