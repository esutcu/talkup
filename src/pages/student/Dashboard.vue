<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-[#3871b1]">Hoş Geldin, {{ user?.name }}</h1>
      <button 
        @click="$router.push('/student/bookings')"
        class="px-4 py-2 bg-[#ff8913] text-white rounded-lg hover:bg-[#ff8913]/90"
      >
        Ders Al
      </button>
    </div>

    <!-- Kredi Durumu -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg border p-6">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-sm text-gray-500">Kredi Bakiyeniz</div>
            <div class="text-2xl font-bold text-[#3871b1] mt-1">{{ credits }} Kredi</div>
          </div>
          <credit-card-icon class="h-6 w-6 text-[#3871b1]" />
        </div>
        <button 
          @click="$router.push('/student/credits')"
          class="mt-4 w-full px-4 py-2 border border-[#3871b1] text-[#3871b1] rounded-lg hover:bg-[#3871b1] hover:text-white"
        >
          Kredi Satın Al
        </button>
      </div>
    </div>

    <!-- Yaklaşan Dersler -->
    <div class="bg-white rounded-lg border">
      <div class="p-4 border-b">
        <h2 class="font-medium">Yaklaşan Derslerim</h2>
      </div>
      <div class="p-4">
        <div v-if="upcomingLessons.length === 0" class="text-center py-8 text-gray-500">
          Henüz rezervasyonunuz bulunmuyor.
          <button 
            @click="$router.push('/student/bookings')"
            class="block mt-2 text-[#3871b1] hover:underline"
          >
            Hemen Ders Alın
          </button>
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="lesson in upcomingLessons" 
            :key="lesson.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <div class="font-medium">{{ lesson.teacher.name }}</div>
              <div class="text-sm text-gray-500">
                {{ formatDateTime(lesson.startTime) }}
              </div>
            </div>
            
            <button 
              v-if="isLessonJoinable(lesson)"
              @click="joinLesson(lesson.meetLink)"
              class="px-4 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
            >
              Derse Katıl
            </button>
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
import { useSupabase } from '@/composables/useSupabase'
import { formatDateTime } from '@/utils/dateTime'

const authStore = useAuthStore()
const { supabase } = useSupabase()

const user = authStore.user
const credits = ref(0)
const upcomingLessons = ref([])

const isLessonJoinable = (lesson) => {
  const now = new Date()
  const lessonTime = new Date(lesson.startTime)
  const diffMinutes = (lessonTime.getTime() - now.getTime()) / (1000 * 60)
  return diffMinutes <= 5 && diffMinutes >= -60
}

const joinLesson = (meetLink) => {
  window.open(meetLink, '_blank')
}

const fetchUpcomingLessons = async () => {
  const { data } = await supabase
    .from('bookings')
    .select(`
      *,
      teacher:teacher_id (name)
    `)
    .eq('student_id', user.value.id)
    .eq('status', 'active')
    .gte('start_time', new Date().toISOString())
    .order('start_time')
    
  if (data) {
    upcomingLessons.value = data
  }
}

onMounted(async () => {
  if (user.value) {
    credits.value = user.value.credits
    await fetchUpcomingLessons()
  }
})
</script>