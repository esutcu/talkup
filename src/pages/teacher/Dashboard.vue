# TeacherDashboard.vue
<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-[#3871b1]">Öğretmen Paneli</h1>
      <button 
        class="px-4 py-2 bg-[#ff8913] hover:bg-[#ff8913]/90 text-white rounded-lg"
        @click="syncCalendar"
      >
        Takvimi Senkronize Et
      </button>
    </div>

    <!-- İstatistik Kartları -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Bugünkü Dersler -->
      <div class="rounded-lg border border-gray-200 border-l-4 border-l-[#3871b1] p-4">
        <div class="flex items-center justify-between pb-2">
          <h2 class="text-sm font-medium">Bugünkü Dersler</h2>
          <calendar-icon class="h-4 w-4 text-[#3871b1]" />
        </div>
        <div class="text-2xl font-bold">{{ todayLessons.length }} Ders</div>
        <p class="text-xs text-gray-500 mt-1">{{ completedLessons.length }} Ders Tamamlandı</p>
      </div>

      <!-- Aktif Öğrenciler -->
      <div class="rounded-lg border border-gray-200 border-l-4 border-l-[#ff8913] p-4">
        <div class="flex items-center justify-between pb-2">
          <h2 class="text-sm font-medium">Aktif Öğrenciler</h2>
          <users-icon class="h-4 w-4 text-[#ff8913]" />
        </div>
        <div class="text-2xl font-bold">{{ activeStudents.length }} Öğrenci</div>
        <p class="text-xs text-gray-500 mt-1">Bu Hafta</p>
      </div>

      <!-- Müsait Saatler -->
      <div class="rounded-lg border border-gray-200 border-l-4 border-l-[#3871b1] p-4">
        <div class="flex items-center justify-between pb-2">
          <h2 class="text-sm font-medium">Müsait Saatler</h2>
          <clock-icon class="h-4 w-4 text-[#3871b1]" />
        </div>
        <div class="text-2xl font-bold">{{ availableSlots.length }} Saat</div>
        <p class="text-xs text-gray-500 mt-1">Önümüzdeki 7 Gün</p>
      </div>
    </div>

    <!-- Günün Programı -->
    <div class="rounded-lg border border-gray-200">
      <div class="p-4 border-b">
        <h2 class="font-medium">Günün Programı</h2>
      </div>
      <div class="p-4">
        <div class="space-y-4">
          <!-- Tamamlanan Dersler -->
          <div 
            v-for="lesson in completedLessons" 
            :key="lesson.id"
            class="flex items-center p-4 bg-gray-50 rounded-lg opacity-75"
          >
            <check-circle-icon class="h-5 w-5 text-green-500" />
            <div class="ml-4 flex-1">
              <h3 class="font-medium text-gray-700">{{ lesson.studentName }}</h3>
              <div class="flex items-center mt-1 text-sm text-gray-500">
                <clock-icon class="h-4 w-4 mr-1" />
                <span>{{ formatTime(lesson.startTime) }} - {{ formatTime(lesson.endTime) }}</span>
              </div>
            </div>
            <button class="px-4 py-2 bg-green-500 text-white rounded-lg" disabled>
              Tamamlandı
            </button>
          </div>

          <!-- Aktif/Yaklaşan Ders -->
          <div 
            v-for="lesson in upcomingLessons" 
            :key="lesson.id"
            class="flex items-center p-4 bg-gray-50 rounded-lg"
            :class="{'border-l-4 border-[#ff8913]': isCurrentLesson(lesson)}"
          >
            <div class="ml-4 flex-1">
              <h3 class="font-medium text-[#3871b1]">{{ lesson.studentName }}</h3>
              <div class="flex items-center mt-1 text-sm text-gray-500">
                <clock-icon class="h-4 w-4 mr-1" />
                <span>{{ formatTime(lesson.startTime) }} - {{ formatTime(lesson.endTime) }}</span>
              </div>
            </div>
            <button 
              class="px-4 py-2 bg-[#3871b1] text-white rounded-lg"
              :disabled="!isLessonJoinable(lesson)"
              @click="joinLesson(lesson)"
            >
              Derse Başla
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Alt Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Hızlı İşlemler -->
      <div class="rounded-lg border border-gray-200">
        <div class="p-4 border-b">
          <h2 class="font-medium">Hızlı İşlemler</h2>
        </div>
        <div class="p-4 flex gap-4">
          <button 
            class="flex-1 px-4 py-2 bg-[#3871b1] hover:bg-[#3871b1]/90 text-white rounded-lg"
            @click="openSlotManager"
          >
            Müsait Saat Ekle
          </button>
          <button 
            class="flex-1 px-4 py-2 bg-[#ff8913] hover:bg-[#ff8913]/90 text-white rounded-lg"
            @click="openCalendarView"
          >
            Takvimi Görüntüle
          </button>
        </div>
      </div>

      <!-- Google Calendar Durumu -->
      <div class="rounded-lg border border-gray-200">
        <div class="p-4 border-b">
          <h2 class="font-medium">Google Calendar Durumu</h2>
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">Son Senkronizasyon</span>
            <span class="text-sm font-medium">{{ lastSync }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, Users, Clock, CheckCircle } from 'lucide-vue-next'
import { useSupabase } from '@/composables/useSupabase'
import { useGoogleCalendar } from '@/composables/useGoogleCalendar'
import { useJoinMeet } from '@/composables/useJoinMeet'
import type { Lesson } from '@/types/Booking'
import type { Slot } from '@/types/Slot'
import { formatTime } from '@/utils/dateTime'

const router = useRouter()
const { supabase } = useSupabase()
const { syncCalendar, lastSyncTime } = useGoogleCalendar()
const { joinMeeting } = useJoinMeet()

// Reactive state
const todayLessons = ref<Lesson[]>([])
const activeStudents = ref<string[]>([])
const availableSlots = ref<Slot[]>([])
const lastSync = computed(() => {
  const minutes = Math.floor((Date.now() - lastSyncTime.value) / 1000 / 60)
  return `${minutes} dakika önce`
})

// Computed
const completedLessons = computed(() => {
  return todayLessons.value.filter(lesson => 
    new Date(lesson.endTime) < new Date()
  )
})

const upcomingLessons = computed(() => {
  return todayLessons.value.filter(lesson => 
    new Date(lesson.endTime) >= new Date()
  )
})

// Methods
const isCurrentLesson = (lesson: Lesson) => {
  const now = new Date()
  const start = new Date(lesson.startTime)
  const end = new Date(lesson.endTime)
  return now >= start && now <= end
}

const isLessonJoinable = (lesson: Lesson) => {
  const now = new Date()
  const start = new Date(lesson.startTime)
  const diffMinutes = (start.getTime() - now.getTime()) / (1000 * 60)
  return diffMinutes <= 5
}

const joinLesson = async (lesson: Lesson) => {
  if (isLessonJoinable(lesson)) {
    await joinMeeting(lesson.meetLink)
  }
}

const openSlotManager = () => {
  router.push('/teacher/calendar/slots')
}

const openCalendarView = () => {
  router.push('/teacher/calendar/view')
}

const fetchTodayLessons = async () => {
  const today = new Date()
  today.setHours(0,0,0,0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .gte('startTime', today.toISOString())
    .lt('startTime', tomorrow.toISOString())
    .order('startTime')

  if (data && !error) {
    todayLessons.value = data
  }
}

const fetchActiveStudents = async () => {
  const { data, error } = await supabase
    .from('lessons')
    .select('distinct student_id')
    .gte('startTime', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  if (data && !error) {
    activeStudents.value = data.map(d => d.student_id)
  }
}

const fetchAvailableSlots = async () => {
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .gte('startTime', new Date().toISOString())
    .lt('startTime', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
    .eq('available', true)

  if (data && !error) {
    availableSlots.value = data
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchTodayLessons()
  fetchActiveStudents()
  fetchAvailableSlots()
})
</script>