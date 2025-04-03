<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-[#3871b1]">Hoş Geldin, {{ userName }}</h1>
      <button 
        class="px-4 py-2 bg-[#ff8913] text-white rounded-lg"
        @click="$router.push('/student/bookings/by-teacher')"
      >
        Ders Al
      </button>
    </div>

    <!-- Kredi Kartı -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="rounded-lg border p-4">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-sm text-gray-500">Kredi Bakiyesi</div>
            <div class="text-2xl font-bold text-[#3871b1] mt-1">{{ credits }} Kredi</div>
          </div>
          <credit-card-icon class="h-6 w-6 text-[#3871b1]" />
        </div>
      </div>
    </div>

    <!-- Yaklaşan Dersler -->
    <div class="rounded-lg border">
      <div class="p-4 border-b">
        <h2 class="font-medium">Yaklaşan Derslerim</h2>
      </div>
      <div class="p-4">
        <div class="space-y-4">
          <div 
            v-for="booking in bookings" 
            :key="booking.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <div class="font-medium">{{ booking.teacher.name }}</div>
              <div class="text-sm text-gray-500">
                {{ formatDate(booking.slot.date) }} - {{ booking.slot.start_time }}
              </div>
            </div>
            <button 
              v-if="isLessonTime(booking)"
              @click="joinLesson(booking.meet_link)"
              class="px-4 py-2 bg-[#3871b1] text-white rounded-lg"
            >
              Derse Katıl
            </button>
          </div>

          <div v-if="bookings.length === 0" class="text-center py-8 text-gray-500">
            Henüz rezervasyonunuz bulunmuyor.
            <div class="mt-2">
              <button 
                @click="$router.push('/student/bookings/by-teacher')"
                class="text-[#3871b1] hover:underline"
              >
                Hemen Ders Alın
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CreditCard as CreditCardIcon } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useBookingStore } from '@/stores/booking'
import { formatDate } from '@/utils/dateTime'

const authStore = useAuthStore()
const bookingStore = useBookingStore()

const userName = ref('')
const credits = ref(0)
const bookings = ref([])

const isLessonTime = (booking: any) => {
  const now = new Date()
  const lessonTime = new Date(booking.slot.date + ' ' + booking.slot.start_time)
  const diffMinutes = (lessonTime.getTime() - now.getTime()) / (1000 * 60)
  return diffMinutes <= 5 && diffMinutes >= -60
}

const joinLesson = (meetLink: string) => {
  window.open(meetLink, '_blank')
}

onMounted(async () => {
  if (authStore.user) {
    userName.value = authStore.user.name
    credits.value = authStore.user.credits
  }
  
  const bookingData = await bookingStore.getBookings()
  bookings.value = bookingData
})
</script>