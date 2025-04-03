import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import type { User } from '@/types/User'

export const useAuthStore = defineStore('auth', () => {
  const { supabase } = useSupabase()
  
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  
  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const userId = computed(() => user.value?.id)
  const userRole = computed(() => user.value?.role)
  
  // Actions
  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (userData) {
        user.value = userData
      }
    }
  }
  
  const login = async (email: string, password: string) => {
    isLoading.value = true
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.session) {
        await loadUser()
      }
      
      return true
    } catch (err) {
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  const logout = async () => {
    await supabase.auth.signOut()
    user.value = null
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    userId,
    userRole,
    login,
    logout,
    loadUser
  }
})