# src/pages/student/Bookings/History.vue
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold text-[#3871b1]">Rezervasyonlarım</h1>
      <button
        @click="router.push('/student/bookings/by-teacher')"
        class="px-4 py-2 bg-[#ff8913] text-white rounded-lg hover:bg-[#ff8913]/90"
      >
        Yeni Rezervasyon
      </button>
    </div>

    <!-- Tab Navigasyonu -->
    <div class="border-b">
      <div class="flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = tab.id"
          class="py-2 px-1 -mb-px text-sm font-medium border-b-2"
          :class="[
            currentTab === tab.id
              ? 'border-[#3871b1] text-[#3871b1]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab.name }}
          <span 
            v-if="getBookingCount(tab.id)" 
            class="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full"
          >
            {{ getBookingCount(tab.id) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Rezervasyon Listesi -->
    <div v-if="isLoading" class="text-center py-12">
      <span class="text-gray-500">Yükleniyor...</span>
    </div>

    <div v-else-if="filteredBookings.length === 0" class="text-center py-12">
      <div class="text-gray-500">Rezervasyon bulunamadı</div>
      <button 
        @click="router.push('/student/bookings/by-teacher')"
        class="mt-4 text-sm text-[#3871b1] hover:underline"
      >
        Yeni rezervasyon yap
      </button>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="booking in filteredBookings"
        :key="booking.id"
        class="border rounded-lg overflow-hidden"
      >
        <div class="p-4 flex items-center gap-4">
          <!-- Öğretmen Bilgisi -->
          <img 
            :src="booking.teacher.avatar" 
            class="w-12 h-12 rounded-full object-cover"
            alt="Öğretmen"
          />
          
          <!-- Ders Detayları -->
          <div class="flex-1">
            <h3 class="font-medium text-[#3871b1]">{{ booking.teacher.name }}</h3>
            <div class="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <calendar-icon class="w-4 h-4" />
              {{ formatDate(booking.date) }}
              <clock-icon class="w-4 h-4 ml-2" />
              {{ formatTime(booking.startTime) }}
            </div>
          </div>

          <!-- Durum ve Aksiyon -->
          <div class="flex items-center gap-4">
            <!-- Durum Badge -->
            <span 
              class="px-2 py-1 text-xs rounded-full"
              :class="getStatusClass(booking.status)"
            >
              {{ getStatusText(booking.status) }}
            </span>

            <!-- Aksiyon Butonu -->
            <button
              v-if="isLessonJoinable(booking)"
              @click="joinLesson(booking)"
              class="px-4 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
            >
              Derse Katıl
            </button>

            <button
              v-else-if="canCancel(booking)"
              @click="confirmCancel(booking)"
              class="px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50"
            >
              İptal Et
            </button>
          </div>
        </div>

        <!-- Google Meet Linki -->
        <div 
          v-if="isLessonJoinable(booking)"
          class="px-4 py-3 bg-gray-50 flex items-center justify-between"
        >
          <div class="font-mono text-sm text-gray-600 truncate">
            {{ booking.meetLink }}
          </div>
          <button 
            @click="copyMeetLink(booking.meetLink)"
            class="text-gray-500 hover:text-gray-700"
          >
            <copy-icon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- İptal Onay Modalı -->
    <modal-dialog v-model="showCancelModal">
      <div class="p-6 space-y-6">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-medium text-[#3871b1]">Rezervasyon İptali</h3>
            <p class="mt-1 text-sm text-gray-500">
              Bu dersi iptal etmek istediğinize emin misiniz?
            </p>
          </div>
          <button @click="showCancelModal = false">
            <x-icon class="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="flex items-center gap-4">
            <img 
              :src="selectedBooking?.teacher.avatar" 
              class="w-12 h-12 rounded-full object-cover"
              alt="Öğretmen"
            />
            <div>
              <div class="font-medium">{{ selectedBooking?.teacher.name }}</div>
              <div class="text-sm text-gray-500">
                {{ formatDate(selectedBooking?.date) }} - 
                {{ formatTime(selectedBooking?.startTime) }}
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button
            @click="showCancelModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Vazgeç
          </button>
          <button
            @click="cancelBooking"
            class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            İptal Et
          </button>
        </div>
      </div>
    </modal-dialog>

    <!-- Bildirim -->
    <div 
      v-if="showCopyNotification"
      class="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg"
    >
      Google Meet linki kopyalandı!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Copy as CopyIcon,
  X as XIcon
} from 'lucide-vue-next'
import { useSupabase } from '@/composables/useSupabase'
import { useBookingStore } from '@/stores/booking'
import { useJoinMeet } from '@/composables/useJoinMeet'
import ModalDialog from '@/components/common/ModalDialog.vue'
import { formatDate, formatTime } from '@/utils/dateTime'
import type { Booking } from '@/types/Booking'

const router = useRouter()
const { supabase } = useSupabase()
const bookingStore = useBookingStore()
const { joinMeeting } = useJoinMeet()

// State
const isLoading = ref(false)
const bookings = ref<Booking[]>([])
const currentTab = ref('upcoming')
const showCancelModal = ref(false)
const selectedBooking = ref<Booking | null>(null)
const showCopyNotification = ref(false)

// Tabs
const tabs = [
  { id: 'upcoming', name: 'Yaklaşan Dersler' },
  { id: 'past', name: 'Geçmiş Dersler' },
  { id: 'cancelled', name: 'İptal Edilenler' }
]

// Computed
const filteredBookings = computed(() => {
  const now = new Date()
  
  return bookings.value.filter(booking => {
    const bookingDate = new Date(booking.date + ' ' + booking.startTime)
    
    if (currentTab.value === 'upcoming') {
      return bookingDate > now && booking.status === 'active'
    }
    if (currentTab.value === 'past') {
      return bookingDate < now && booking.status === 'completed'
    }
    return booking.status === 'cancelled'
  })
})

// Methods
const fetchBookings = async () => {
  isLoading.value = true
  
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      teacher:teacher_id (
        name,
        avatar
      )
    `)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (data && !error) {
    bookings.value = data
  }
  
  isLoading.value = false
}

const getBookingCount = (tab: string) => {
  if (tab === 'upcoming') {
    return bookings.value.filter(b => 
      new Date(b.date + ' ' + b.startTime) > new Date() && 
      b.status === 'active'
    ).length
  }
  if (tab === 'past') {
    return bookings.value.filter(b => 
      new Date(b.date + ' ' + b.startTime) < new Date() && 
      b.status === 'completed'
    ).length
  }
  return bookings.value.filter(b => b.status === 'cancelled').length
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Aktif'
    case 'completed':
      return 'Tamamlandı'
    case 'cancelled':
      return 'İptal Edildi'
    default:
      return status
  }
}

const isLessonJoinable = (booking: Booking) => {
  const now = new Date()
  const lessonTime = new Date(booking.date + ' ' + booking.startTime)
  const diffMinutes = (lessonTime.getTime() - now.getTime()) / (1000 * 60)
  return diffMinutes <= 5 && diffMinutes >= -60 && booking.status === 'active'
}

const canCancel = (booking: Booking) => {
  const now = new Date()
  const lessonTime = new Date(booking.date + ' ' + booking.startTime)
  const diffHours = (lessonTime.getTime() - now.getTime()) / (1000 * 60 * 60)
  return diffHours > 24 && booking.status === 'active'
}

const joinLesson = async (booking: Booking) => {
  if (isLessonJoinable(booking)) {
    await joinMeeting(booking.meetLink)
  }
}

const confirmCancel = (booking: Booking) => {
  selectedBooking.value = booking
  showCancelModal.value = true
}

const cancelBooking = async () => {
  if (!selectedBooking.value) return

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', selectedBooking.value.id)

  if (!error) {
    // Krediyi geri yükle
    await bookingStore.refundCredit()
    await fetchBookings()
    showCancelModal.value = false
  }
}

const copyMeetLink = (link: string) => {
  navigator.clipboard.writeText(link)
  showCopyNotification.value = true
  setTimeout(() => {
    showCopyNotification.value = false
  }, 2000)
}

// Initial load
onMounted(() => {
  fetchBookings()
})
</script>