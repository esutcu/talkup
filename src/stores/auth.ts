import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const { supabase } = useSupabase()
  
  // State
  const user = ref<User | null>(null)
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
      console.error('Login error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const register = async (email: string, password: string, name: string) => {
    isLoading.value = true
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })
      
      if (authError) throw authError
      
      if (authData.user) {
        const { error: dbError } = await supabase.from('users').insert({
          id: authData.user.id,
          email,
          name,
          role: 'student',
          status: 'active',
          credits: 0
        })
        
        if (dbError) throw dbError
        
        await loadUser(authData.user.id)
      }
      
      return true
    } catch (err) {
      console.error('Register error:', err)
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
      user.value = data as User
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