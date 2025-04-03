import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

export const useAuthStore = defineStore('auth', () => {
  const { supabase } = useSupabase()
  
  // State
  const user = ref(null)
  const isLoading = ref(false)
  
  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role)
  
  // Actions
  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.user) {
        await loadUser(data.user.id)
      }
      
      return true
    } catch (err) {
      return false
    } finally {
      isLoading.value = false
    }
  }

  const register = async (email: string, password: string, role: string) => {
    isLoading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email,
          role,
          credits: role === 'student' ? 0 : null
        })
        
        await loadUser(data.user.id)
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

  const loadUser = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
      
    if (data) {
      user.value = data
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    userRole,
    login,
    register,
    logout,
    loadUser
  }
})