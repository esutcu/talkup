import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/stores/auth'
import { useCredits } from '@/composables/useCredits'
import { useJoinMeet } from '@/composables/useJoinMeet'
import type { Booking } from '@/types/Booking'

// Booking store - ders rezervasyon işlemleri için
export const useBookingStore = defineStore('booking', () => {
  const { supabase } = useSupabase()
  const authStore = useAuthStore()
  const { useCredit, refundCredit } = useCredits()
  const { createMeetLink } = useJoinMeet()
  
  // State
  const currentBooking = ref<Booking | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Computed
  const userId = computed(() => authStore.userId || '')
  
  // Yeni rezervasyon oluşturma
  const createBooking = async (bookingData: {
    teacherId: string
    date: Date
    startTime: string
  }) => {
    if (!userId.value) {
      error.value = 'Rezervasyon yapmak için giriş yapmalısınız'
      return null
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      // Kredi kullanımı
      const creditResult = await useCredit(userId.value)
      if (!creditResult) {
        throw new Error('Yetersiz kredi')
      }
      
      // Formatlı tarih
      const formattedDate = bookingData.date.toISOString().split('T')[0]
      
      // Meet linki oluştur
      const meetId = `${Date.now()}-${userId.value.substring(0, 6)}-${bookingData.teacherId.substring(0, 6)}`
      const meetLink = createMeetLink(meetId)
      
      // Rezervasyon oluştur
      const bookingInsert = {
        student_id: userId.value,
        teacher_id: bookingData.teacherId,
        date: formattedDate,
        start_time: bookingData.startTime,
        status: 'active',
        meet_link: meetLink,
      }
      
      const { data, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingInsert)
        .select()
        .single()
      
      if (bookingError) throw bookingError
      
      // Slot'u güncelle (müsait değil olarak işaretle)
      await supabase
        .from('slots')
        .update({ is_available: false, booking_id: data.id })
        .eq('teacher_id', bookingData.teacherId)
        .eq('date', formattedDate)
        .eq('start_time', bookingData.startTime)
      
      // Öğretmene bildirim gönder
      await supabase
        .from('notifications')
        .insert({
          user_id: bookingData.teacherId,
          type: 'booking_confirmed',
          title: 'Yeni Rezervasyon',
          message: `${formattedDate} tarihinde saat ${bookingData.startTime} için yeni bir rezervasyonunuz var.`,
        })
      
      currentBooking.value = data
      return data
    } catch (err: any) {
      console.error('Booking creation error:', err)
      error.value = err.message
      
      // Hata durumunda krediyi iade et
      if (error.value === 'Yetersiz kredi') {
        return null
      }
      
      await refundCredit(userId.value)
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  // Rezervasyon iptal etme
  const cancelBooking = async (bookingId: string) => {
    if (!userId.value) {
      error.value = 'İşlem yapmak için giriş yapmalısınız'
      return false
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      // Rezervasyonu bul
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()
      
      if (bookingError) throw bookingError
      
      // Sadece aktif rezervasyonlar iptal edilebilir
      if (booking.status !== 'active') {
        throw new Error('Bu rezervasyon iptal edilemez')
      }
      
      // Rezervasyon saatini kontrol et (24 saatten az kaldıysa iptal edilemez)
      const bookingDate = new Date(`${booking.date} ${booking.start_time}`)
      const now = new Date()
      const timeDiff = bookingDate.getTime() - now.getTime()
      const hoursDiff = timeDiff / (1000 * 60 * 60)
      
      if (hoursDiff < 24) {
        throw new Error('Derse 24 saatten az kaldığında iptal edilemez')
      }
      
      // Rezervasyonu iptal et
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
      
      if (updateError) throw updateError
      
      // Krediyi iade et
      await refundCredit(userId.value)
      
      // Slot'u tekrar müsait olarak işaretle
      await supabase
        .from('slots')
        .update({ is_available: true, booking_id: null })
        .eq('booking_id', bookingId)
      
      // Öğretmene bildirim gönder
      await supabase
        .from('notifications')
        .insert({
          user_id: booking.teacher_id,
          type: 'booking_cancelled',
          title: 'Rezervasyon İptali',
          message: `${booking.date} tarihinde saat ${booking.start_time} için olan rezervasyon iptal edildi.`,
        })
      
      return true
    } catch (err: any) {
      console.error('Booking cancellation error:', err)
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Öğrencinin rezervasyonlarını getir
  const getStudentBookings = async () => {
    if (!userId.value) {
      error.value = 'İşlem yapmak için giriş yapmalısınız'
      return []
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          teacher:teacher_id (
            name,
            avatar
          )
        `)
        .eq('student_id', userId.value)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
      
      if (bookingsError) throw bookingsError
      
      return data || []
    } catch (err: any) {
      console.error('Get bookings error:', err)
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  // Öğretmenin rezervasyonlarını getir
  const getTeacherBookings = async () => {
    if (!userId.value) {
      error.value = 'İşlem yapmak için giriş yapmalısınız'
      return []
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          student:student_id (
            name,
            avatar
          )
        `)
        .eq('teacher_id', userId.value)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
      
      if (bookingsError) throw bookingsError
      
      return data || []
    } catch (err: any) {
      console.error('Get teacher bookings error:', err)
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    currentBooking,
    isLoading,
    error,
    userId,
    createBooking,
    cancelBooking,
    getStudentBookings,
    getTeacherBookings
  }
})