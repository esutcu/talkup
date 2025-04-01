import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import type { Teacher } from '@/types/User'

export const useTeacherFilterStore = defineStore('teacherFilter', () => {
  const { supabase } = useSupabase()
  
  // State
  const teachers = ref<Teacher[]>([])
  const searchQuery = ref('')
  const selectedDate = ref<Date | null>(null)
  const selectedTime = ref<string | null>(null)
  const availabilityFilter = ref<'today' | 'week' | 'any' | ''>('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Computed
  const filteredTeachers = computed(() => {
    let filtered = teachers.value
    
    // İsim araması
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(teacher => 
        teacher.name.toLowerCase().includes(query)
      )
    }
    
    // Müsaitlik filtresi
    if (availabilityFilter.value) {
      const now = new Date()
      
      filtered = filtered.filter(teacher => {
        if (!teacher.nextAvailableSlots?.length) return false
        
        if (availabilityFilter.value === 'today') {
          return teacher.nextAvailableSlots.some(slot => {
            const slotDate = new Date(slot)
            return slotDate.getDate() === now.getDate() &&
                  slotDate.getMonth() === now.getMonth() &&
                  slotDate.getFullYear() === now.getFullYear()
          })
        }
        
        if (availabilityFilter.value === 'week') {
          const weekFromNow = new Date(now)
          weekFromNow.setDate(weekFromNow.getDate() + 7)
          
          return teacher.nextAvailableSlots.some(slot => {
            const slotDate = new Date(slot)
            return slotDate <= weekFromNow
          })
        }
        
        return true
      })
    }
    
    // Belirli tarih ve saat seçimi
    if (selectedDate.value && selectedTime.value) {
      const formattedDate = selectedDate.value.toISOString().split('T')[0]
      
      filtered = filtered.filter(teacher => {
        if (!teacher.slots?.length) return false
        
        return teacher.slots.some(slot => 
          slot.date === formattedDate && 
          slot.start_time === selectedTime.value && 
          slot.is_available
        )
      })
    }
    
    return filtered
  })
  
  // Temel öğretmenleri getir
  const fetchTeachers = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: teachersError } = await supabase
        .from('users')
        .select(`
          *,
          slots (
            id,
            date,
            start_time,
            is_available
          )
        `)
        .eq('role', 'teacher')
        .eq('status', 'active')
      
      if (teachersError) throw teachersError
      
      teachers.value = data.map((teacher: any) => ({
        ...teacher,
        nextAvailableSlots: teacher.slots
          .filter((slot: any) => slot.is_available && new Date(slot.date + ' ' + slot.start_time) > new Date())
          .map((slot: any) => slot.date + ' ' + slot.start_time)
          .sort()
      }))
      
      return data
    } catch (err: any) {
      console.error('Fetch teachers error:', err)
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  // Belirli bir tarih ve saatte müsait öğretmenleri getir
  const fetchAvailableTeachers = async (date: Date, time: string) => {
    isLoading.value = true
    error.value = null
    
    try {
      const formattedDate = date.toISOString().split('T')[0]
      
      const { data, error: slotsError } = await supabase
        .from('slots')
        .select(`
          teacher:teacher_id (
            id,
            name,
            avatar,
            bio
          )
        `)
        .eq('date', formattedDate)
        .eq('start_time', time)
        .eq('is_available', true)
      
      if (slotsError) throw slotsError
      
      return data.map((item: any) => item.teacher)
    } catch (err: any) {
      console.error('Fetch available teachers error:', err)
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  // Filtre işlemleri
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }
  
  const setAvailabilityFilter = (filter: 'today' | 'week' | 'any' | '') => {
    availabilityFilter.value = filter
  }
  
  const setSelectedDateTime = (date: Date, time: string) => {
    selectedDate.value = date
    selectedTime.value = time
  }
  
  const clearFilters = () => {
    searchQuery.value = ''
    availabilityFilter.value = ''
    selectedDate.value = null
    selectedTime.value = null
  }
  
  // Başlangıçta öğretmenleri yükle
  fetchTeachers()
  
  return {
    // State
    teachers,
    searchQuery,
    selectedDate,
    selectedTime,
    availabilityFilter,
    isLoading,
    error,
    
    // Computed
    filteredTeachers,
    
    // Actions
    fetchTeachers,
    fetchAvailableTeachers,
    setSearchQuery,
    setAvailabilityFilter,
    setSelectedDateTime,
    clearFilters
  }
})