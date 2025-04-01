import { ref, computed } from 'vue'
import { useSupabase } from './useSupabase'
import type { Booking } from '@/types/Booking'

export function useBookingFilters() {
  const { supabase } = useSupabase()
  
  // State
  const bookings = ref<Booking[]>([])
  const statusFilter = ref<'all' | 'active' | 'completed' | 'cancelled'>('all')
  const dateRangeFilter = ref<'today' | 'week' | 'month' | 'all'>('all')
  const searchQuery = ref('')
  const selectedTeacher = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Filtrelenmiş rezervasyonlar
  const filteredBookings = computed(() => {
    let filtered = bookings.value
    
    // Durum filtresi
    if (statusFilter.value !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter.value)
    }
    
    // Tarih aralığı filtresi
    if (dateRangeFilter.value !== 'all') {
      const now = new Date()
      let startDate: Date
      
      if (dateRangeFilter.value === 'today') {
        startDate = new Date(now.setHours(0, 0, 0, 0))
        const endDate = new Date(now)
        endDate.setDate(endDate.getDate() + 1)
        endDate.setHours(0, 0, 0, 0)
        
        filtered = filtered.filter(booking => {
          const bookingDate = new Date(booking.date + ' ' + booking.start_time)
          return bookingDate >= startDate && bookingDate < endDate
        })
      }
      
      if (dateRangeFilter.value === 'week') {
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 7)
        
        filtered = filtered.filter(booking => {
          const bookingDate = new Date(booking.date + ' ' + booking.start_time)
          return bookingDate >= startDate && bookingDate < endDate
        })
      }
      
      if (dateRangeFilter.value === 'month') {
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + 1)
        
        filtered = filtered.filter(booking => {
          const bookingDate = new Date(booking.date + ' ' + booking.start_time)
          return bookingDate >= startDate && bookingDate < endDate
        })
      }
    }
    
    // Arama sorgusu
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(booking => 
        (booking.teacher?.name?.toLowerCase().includes(query)) ||
        booking.date.includes(query) ||
        booking.start_time.includes(query)
      )
    }
    
    // Öğretmen filtresi
    if (selectedTeacher.value) {
      filtered = filtered.filter(booking => 
        booking.teacher_id === selectedTeacher.value
      )
    }
    
    return filtered
  })
  
  // Yaklaşan dersler (bugün ve sonrası, sadece aktif)
  const upcomingBookings = computed(() => {
    const now = new Date()
    
    return bookings.value.filter(booking => {
      const bookingDate = new Date(booking.date + ' ' + booking.start_time)
      return bookingDate >= now && booking.status === 'active'
    }).sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.start_time)
      const dateB = new Date(b.date + ' ' + b.start_time)
      return dateA.getTime() - dateB.getTime()
    })
  })
  
  // Geçmiş dersler (bugünden önceki, tamamlanmış)
  const pastBookings = computed(() => {
    const now = new Date()
    
    return bookings.value.filter(booking => {
      const bookingDate = new Date(booking.date + ' ' + booking.start_time)
      return bookingDate < now && booking.status === 'completed'
    }).sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.start_time)
      const dateB = new Date(b.date + ' ' + b.start_time)
      return dateB.getTime() - dateA.getTime() // en son olanlar önce
    })
  })
  
  // Bugünkü dersler
  const todayBookings = computed(() => {
    const now = new Date()
    const today = new Date(now.setHours(0, 0, 0, 0))
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return bookings.value.filter(booking => {
      const bookingDate = new Date(booking.date + ' ' + booking.start_time)
      return bookingDate >= today && bookingDate < tomorrow && booking.status === 'active'
    }).sort((a, b) => {
      const timeA = a.start_time
      const timeB = b.start_time
      return timeA.localeCompare(timeB)
    })
  })
  
  // İptal edilen dersler
  const cancelledBookings = computed(() => {
    return bookings.value.filter(booking => 
      booking.status === 'cancelled'
    ).sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.start_time)
      const dateB = new Date(b.date + ' ' + b.start_time)
      return dateB.getTime() - dateA.getTime() // en son iptal edilenler önce
    })
  })
  
  // Rezervasyonları getir
  const fetchBookings = async (userId: string, isStudent: boolean = true) => {
    isLoading.value = true
    error.value = null
    
    try {
      // Alan tipi (öğrenci veya öğretmen)
      const userField = isStudent ? 'student_id' : 'teacher_id'
      
      const { data, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          teacher:teacher_id (
            name,
            avatar
          ),
          student:student_id (
            name,
            avatar
          )
        `)
        .eq(userField, userId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
      
      if (bookingsError) throw bookingsError
      
      bookings.value = data || []
      return data
    } catch (err: any) {
      console.error('Fetch bookings error:', err)
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  // Filtre işlemleri
  const setStatusFilter = (status: 'all' | 'active' | 'completed' | 'cancelled') => {
    statusFilter.value = status
  }
  
  const setDateRangeFilter = (range: 'today' | 'week' | 'month' | 'all') => {
    dateRangeFilter.value = range
  }
  
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }
  
  const setSelectedTeacher = (teacherId: string | null) => {
    selectedTeacher.value = teacherId
  }
  
  const clearFilters = () => {
    statusFilter.value = 'all'
    dateRangeFilter.value = 'all'
    searchQuery.value = ''
    selectedTeacher.value = null
  }
  
  return {
    // State
    bookings,
    statusFilter,
    dateRangeFilter,
    searchQuery,
    selectedTeacher,
    isLoading,
    error,
    
    // Computed
    filteredBookings,
    upcomingBookings,
    pastBookings,
    todayBookings,
    cancelledBookings,
    
    // Actions
    fetchBookings,
    setStatusFilter,
    setDateRangeFilter,
    setSearchQuery,
    setSelectedTeacher,
    clearFilters
  }
}