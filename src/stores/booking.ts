import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from './auth'

export const useBookingStore = defineStore('booking', () => {
  const { supabase } = useSupabase()
  const authStore = useAuthStore()
  
  const isLoading = ref(false)

  // Öğretmenleri getir
  const getTeachers = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'teacher')
      .eq('status', 'active')
    
    return data || []
  }

  // Müsait saatleri getir
  const getAvailableSlots = async (teacherId: string, date: string) => {
    const { data } = await supabase
      .from('slots')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('date', date)
      .eq('is_booked', false)
    
    return data || []
  }

  // Rezervasyon yap
  const createBooking = async (teacherId: string, slotId: string) => {
    if (!authStore.userId) return null

    isLoading.value = true
    
    try {
      // Slot'u kilitle
      const { data: slot } = await supabase
        .from('slots')
        .update({ is_booked: true })
        .eq('id', slotId)
        .select()
        .single()

      if (!slot) throw new Error('Slot bulunamadı')

      // Meet linki oluştur
      const meetId = Math.random().toString(36).substring(7)
      const meetLink = `https://meet.google.com/lookup/${meetId}`

      // Booking oluştur
      const { data: booking } = await supabase
        .from('bookings')
        .insert({
          student_id: authStore.userId,
          teacher_id: teacherId,
          slot_id: slotId,
          meet_link: meetLink
        })
        .select()
        .single()

      return booking
    } catch (error) {
      console.error('Booking error:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Rezervasyonları getir
  const getBookings = async () => {
    if (!authStore.userId) return []

    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        teacher:teacher_id (name),
        slot:slot_id (date, start_time)
      `)
      .eq(authStore.userRole?.value === 'teacher' ? 'teacher_id' : 'student_id', authStore.userId)
      .order('created_at', { ascending: false })

    return data || []
  }

  return {
    isLoading,
    getTeachers,
    getAvailableSlots,
    createBooking,
    getBookings
  }
})