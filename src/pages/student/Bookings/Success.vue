# src/pages/student/Bookings/Success.vue
<template>
  <div class="max-w-2xl mx-auto py-8 px-4">
    <!-- Başarı Kartı -->
    <div class="text-center space-y-4">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
        <check-icon class="w-8 h-8 text-green-600" />
      </div>
      <h1 class="text-2xl font-semibold text-[#3871b1]">Rezervasyon Tamamlandı!</h1>
      <p class="text-gray-600">Dersiniz başarıyla rezerve edildi.</p>
    </div>

    <!-- Ders Detayları -->
    <div class="mt-8 border rounded-lg overflow-hidden">
      <div class="p-6 space-y-6">
        <!-- Öğretmen Bilgisi -->
        <div class="flex items-center gap-4">
          <img 
            :src="booking?.teacher?.avatar" 
            class="w-16 h-16 rounded-full object-cover"
            alt="Öğretmen"
          />
          <div>
            <h3 class="font-medium text-[#3871b1]">{{ booking?.teacher?.name }}</h3>
          </div>
        </div>

        <!-- Tarih ve Saat -->
        <div class="grid grid-cols-2 gap-4 py-4 border-y">
          <div>
            <div class="text-sm text-gray-500">Tarih</div>
            <div class="font-medium">{{ formatDate(booking?.date) }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Saat</div>
            <div class="font-medium">{{ formatTime(booking?.startTime) }}</div>
          </div>
        </div>

        <!-- Google Meet Linki -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="text-sm text-gray-500 mb-2">Google Meet Linki</div>
          <div class="flex items-center justify-between gap-4">
            <div class="font-mono text-sm truncate">{{ booking?.meetLink }}</div>
            <button 
              @click="copyMeetLink"
              class="text-[#3871b1] hover:text-[#3871b1]/80"
            >
              <copy-icon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Kredi Bilgisi -->
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-[#3871b1]">Kalan Krediniz</div>
              <div class="text-2xl font-bold text-[#3871b1]">{{ remainingCredits }} Kredi</div>
            </div>
            <credit-card-icon class="w-8 h-8 text-[#3871b1]" />
          </div>
        </div>
      </div>
    </div>

    <!-- Aksiyon Butonları -->
    <div class="mt-8 flex gap-4">
      <button
        @click="router.push('/student/bookings/history')"
        class="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
      >
        Rezervasyonlarım
      </button>
      <button
        @click="router.push('/student/bookings/by-teacher')"
        class="flex-1 px-4 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
      >
        Yeni Rezervasyon
      </button>
    </div>

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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Check as CheckIcon, 
  Copy as CopyIcon,  
  CreditCard as CreditCardIcon 
} from 'lucide-vue-next'
import { useSupabase } from '@/composables/useSupabase'
import { useBookingStore } from '@/stores/booking'
import { formatDate, formatTime } from '@/utils/dateTime'
import type { Booking } from '@/types/Booking'

const router = useRouter()
const route = useRoute()
const { supabase } = useSupabase()
const bookingStore = useBookingStore()

// State
const booking = ref<Booking | null>(null)
const remainingCredits = ref(0)
const showCopyNotification = ref(false)

// Methods
const fetchBookingDetails = async () => {
  const bookingId = route.params.id as string
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      teacher:teacher_id (
        name,
        avatar
      )
    `)
    .eq('id', bookingId)
    .single()

  if (data && !error) {
    booking.value = data
  }

  // Kalan kredileri getir
  const { data: credits } = await supabase
    .from('users')
    .select('credits')
    .eq('id', bookingStore.userId)
    .single()

  if (credits) {
    remainingCredits.value = credits.credits
  }
}

const copyMeetLink = () => {
  if (booking.value?.meetLink) {
    navigator.clipboard.writeText(booking.value.meetLink)
    showCopyNotification.value = true
    setTimeout(() => {
      showCopyNotification.value = false
    }, 2000)
  }
}

// Initial load
onMounted(() => {
  fetchBookingDetails()
})
</script>