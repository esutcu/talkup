import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import type { User } from '@/types/User'

export const useAuthStore = defineStore('auth', () => {
  const { supabase } = useSupabase()
  
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const userId = computed(() => user.value?.id)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isTeacher = computed(() => user.value?.role === 'teacher')
  const isStudent = computed(() => user.value?.role === 'student')
  
  // Actions
  const loadUser = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // Mevcut oturum kontrolü
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      
      if (session) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (userError) throw userError
        
        user.value = userData
      }
    } catch (err: any) {
      console.error('User load error:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }
  
  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Email/Şifre ile giriş yapma
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (signInError) throw signInError
      
      if (data.session) {
        // Kullanıcı bilgilerini çek
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user?.id)
          .single()
        
        if (userError) throw userError
        
        user.value = userData
      }
      
      return true
    } catch (err: any) {
      console.error('Login error:', err)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  const register = async (email: string, password: string, name: string, role: 'student' | 'teacher') => {
    isLoading.value = true
    error.value = null
    
    try {
      // Yeni kullanıcı oluşturma
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (signUpError) throw signUpError
      
      if (data.user) {
        // Kullanıcı profil bilgilerini oluştur
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name,
            role,
            credits: role === 'student' ? 0 : null,
            status: 'active'
          })
        
        if (insertError) throw insertError
        
        // Yeni kullanıcı bilgilerini çek
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (userError) throw userError
        
        user.value = userData
      }
      
      return true
    } catch (err: any) {
      console.error('Register error:', err)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  const logout = async () => {
    isLoading.value = true
    
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) throw signOutError
      
      user.value = null
      return true
    } catch (err: any) {
      console.error('Logout error:', err)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Auth durumu değişikliğini dinleme
  const setupAuthListener = () => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Kullanıcı bilgilerini çek
        const { data, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (!userError && data) {
          user.value = data
        }
      }
      
      if (event === 'SIGNED_OUT') {
        user.value = null
      }
    })
  }
  
  // Başlangıçta oturum kontrolü
  loadUser()
  setupAuthListener()
  
  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    userId,
    isAdmin,
    isTeacher,
    isStudent,
    login,
    register,
    logout,
    loadUser
  }
})