<!-- StudentDashboard.vue -->
<template>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-[#3871b1]">Hoş Geldin, {{ studentName }}</h1>
        <button 
          class="px-4 py-2 bg-[#ff8913] hover:bg-[#ff8913]/90 text-white rounded-lg"
          @click="handleQuickBook"
        >
          Hızlı Ders Al
        </button>
      </div>
  
      <!-- Ana Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Kredi Bakiyesi Kartı -->
        <div class="rounded-lg border border-gray-200 border-l-4 border-l-[#3871b1] p-4">
          <div class="flex items-center justify-between pb-2">
            <h2 class="text-sm font-medium">Kredi Bakiyesi</h2>
            <credit-card-icon class="h-4 w-4 text-[#3871b1]" />
          </div>
          <div class="text-2xl font-bold">{{ credits }} Kredi</div>
          <p class="text-xs text-gray-500 mt-1">Son Alınan: {{ lastPackage }}</p>
        </div>
  
        <!-- Yaklaşan Dersler Kartı -->
        <div class="rounded-lg border border-gray-200 border-l-4 border-l-[#ff8913] p-4">
          <div class="flex items-center justify-between pb-2">
            <h2 class="text-sm font-medium">Yaklaşan Dersler</h2>
            <calendar-icon class="h-4 w-4 text-[#ff8913]" />
          </div>
          <div class="text-2xl font-bold">{{ upcomingLessons.length }} Ders</div>
          <p class="text-xs text-gray-500 mt-1">Bu Hafta</p>
        </div>
      </div>
  
      <!-- Yaklaşan Dersler Listesi -->
      <div class="rounded-lg border border-gray-200">
        <div class="p-4 border-b">
          <h2 class="font-medium">Yaklaşan Derslerim</h2>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div 
              v-for="lesson in upcomingLessons" 
              :key="lesson.id" 
              class="flex items-center p-4 bg-gray-50 rounded-lg"
            >
              <div class="ml-4 flex-1">
                <h3 class="font-medium text-[#3871b1]">{{ lesson.teacherName }}</h3>
                <div class="flex items-center mt-1 text-sm text-gray-500">
                  <clock-icon class="h-4 w-4 mr-1" />
                  <span>{{ formatDateTime(lesson.startTime) }}</span>
                </div>
              </div>
              <button 
                class="px-4 py-2 bg-[#3871b1] text-white rounded-lg"
                :disabled="!isLessonJoinable(lesson)"
                @click="joinLesson(lesson)"
              >
                Derse Katıl
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Son Dersler -->
      <div class="rounded-lg border border-gray-200">
        <div class="p-4 border-b">
          <h2 class="font-medium">Son Derslerim</h2>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div 
              v-for="lesson in pastLessons" 
              :key="lesson.id" 
              class="flex items-center p-4 bg-gray-50 rounded-lg"
            >
              <div class="ml-4">
                <h3 class="font-medium text-gray-700">{{ lesson.teacherName }}</h3>
                <div class="flex items-center mt-1 text-sm text-gray-500">
                  <clock-icon class="h-4 w-4 mr-1" />
                  <span>{{ formatDateTime(lesson.startTime) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { CreditCard as CreditCardIcon, Calendar as CalendarIcon, Clock as ClockIcon } from 'lucide-vue-next'
  import { useSupabase } from '@/composables/useSupabase'
  import { useJoinMeet } from '@/composables/useJoinMeet'
  import type { Lesson } from '@/types/Booking'
  import { formatDateTime } from '@/utils/dateTime'
  
  // Store'dan kullanıcı bilgilerini al
  const studentName = ref('Öğrenci')
  const credits = ref(5)
  const lastPackage = ref('10 Kredilik Paket')
  
  const upcomingLessons = ref<Lesson[]>([])
  const pastLessons = ref<Lesson[]>([])
  
  const { supabase } = useSupabase()
  const { joinMeeting } = useJoinMeet()
  
  const isLessonJoinable = (lesson: Lesson) => {
    const now = new Date()
    const lessonTime = new Date(lesson.startTime)
    const diffMinutes = (lessonTime.getTime() - now.getTime()) / (1000 * 60)
    return diffMinutes <= 5 && diffMinutes >= -60 // Dersten 5 dk önce ile 60 dk sonrası arası
  }
  
  const joinLesson = async (lesson: Lesson) => {
    if (isLessonJoinable(lesson)) {
      await joinMeeting(lesson.meetLink)
    }
  }
  
  const handleQuickBook = () => {
    // Hızlı ders alma sayfasına yönlendir
  }
  
  const fetchLessons = async () => {
    // Supabase'den ders verilerini çek
    const { data: upcoming, error: upcomingError } = await supabase
      .from('lessons')
      .select('*')
      .gt('startTime', new Date().toISOString())
      .order('startTime')
      .limit(5)
  
    if (upcoming && !upcomingError) {
      upcomingLessons.value = upcoming
    }
  
    const { data: past, error: pastError } = await supabase
      .from('lessons')
      .select('*')
      .lt('startTime', new Date().toISOString())
      .order('startTime', { ascending: false })
      .limit(5)
  
    if (past && !pastError) {
      pastLessons.value = past
    }
  }
  
  onMounted(() => {
    fetchLessons()
  })
  </script>