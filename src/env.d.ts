/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_GOOGLE_API_KEY: string
    readonly VITE_GOOGLE_CLIENT_ID: string
    readonly VITE_PUBLIC_URL: string
    readonly VITE_IYZIPAY_API_KEY?: string
    readonly VITE_IYZIPAY_SECRET_KEY?: string
    readonly VITE_IYZIPAY_BASE_URL?: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }