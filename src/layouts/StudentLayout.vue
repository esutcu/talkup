# src/layouts/StudentLayout.vue
<template>
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <div class="w-64 bg-white border-r">
      <div class="h-16 flex items-center px-6 border-b">
        <h1 class="text-xl font-semibold text-[#3871b1]">Öğrenci Paneli</h1>
      </div>

      <nav class="p-4 space-y-1">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
          :class="{ 'bg-gray-100 text-[#3871b1]': isActive(item.path) }"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
        </router-link>
      </nav>

      <!-- Credit Balance -->
      <div class="p-4 mt-4">
        <div class="p-4 bg-blue-50 rounded-lg">
          <div class="flex items-center justify-between">
            <div class="text-sm text-[#3871b1]">Kredi Bakiyeniz</div>
            <credit-card-icon class="w-5 h-5 text-[#3871b1]" />
          </div>
          <div class="mt-1 text-2xl font-bold text-[#3871b1]">
            {{ credits }}
          </div>
          <router-link
            to="/student/credits/buy"
            class="mt-2 text-sm text-[#ff8913] hover:text-[#ff8913]/90"
          >
            Kredi Satın Al
          </router-link>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Top Bar -->
      <div class="h-16 bg-white border-b flex items-center justify-between px-6">
        <div class="flex items-center">
          <h2 class="text-lg font-medium text-gray-800">
            {{ currentPageTitle }}
          </h2>
        </div>

        <!-- Quick Actions -->
        <div class="flex items-center gap-4">
          <!-- Next Lesson Indicator -->
          <div v-if="nextLesson" class="text-sm">
            <span class="text-gray-500">Sonraki Dersiniz:</span>
            <span class="ml-2 font-medium">{{ formatDateTime(nextLesson.startTime) }}</span>
            <button
              v-if="isLessonJoinable(nextLesson)"
              @click="joinLesson(nextLesson)"
              class="ml-2 px-3 py-1 bg-[#3871b1] text-white text-sm rounded-lg hover:bg-[#3871b1]/90"
            >
              Derse Katıl
            </button>
          </div>

          <!-- User Menu -->
          <div class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center"
            >
              <img
                :src="user?.avatar || '/default-avatar.png'"
                alt="User"
                class="w-8 h-8 rounded-full"
              />
              <chevron-down-icon class="w-4 h-4 ml-2 text-gray-500" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1"
            >
              <a
                href="#"
                @click.prevent="logout"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Çıkış Yap
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Page Content -->
      <div class="flex-1 overflow-auto bg-gray-50 p-6">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSupabase } from '@/composables/useSupabase'
import { useJoinMeet } from '@/composables/useJoinMeet'
import {
  LayoutDashboard,
  Calendar,
  Clock,
  CreditCard as CreditCardIcon,
  ChevronDown as ChevronDownIcon,
  History
} from 'lucide-vue-next'
import { formatDateTime } from '@/utils/dateTime'
import type { Lesson } from '@/types/Booking'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { supabase } = useSupabase()
const { joinMeeting } = useJoinMeet()

const showUserMenu = ref(false)
const user = computed(() => authStore.user)
const nextLesson = ref<Lesson | null>(null)
const credits = ref(0)

// Menu items
const menuItems = [
  {
    name: 'Dashboard',
    path: '/student',
    icon: LayoutDashboard
  },
  {
    name: 'Öğretmene Göre Ders Al',
    path: '/student/bookings/by-teacher',
    icon: Calendar
  },
  {
    name: 'Saate Göre Ders Al',
    path: '/student/bookings/by-time',
    icon: Clock
  },
  {
    name: 'Ders Geçmişi',
    path: '/student/bookings/history',
    icon: History
  }
]

// Active menu item control
const isActive = (path: string) => {
  return route.path === path
}

// Current page title
const currentPageTitle = computed(() => {
  const currentItem = menuItems.find(item => isActive(item.path))
  return currentItem?.name || 'Öğrenci Paneli'
})

// Lesson methods
const isLessonJoinable = (lesson: Lesson) => {
  const now = new Date()
  const lessonTime = new Date(lesson.startTime)
  const diffMinutes = (lessonTime.getTime() - now.getTime()) / (1000 * 60)
  return diffMinutes <= 5 && diffMinutes >= -60
}

const joinLesson = async (lesson: Lesson) => {
  if (isLessonJoinable(lesson)) {
    await joinMeeting(lesson.meetLink)
  }
}

// Fetch data
const fetchUserData = async () => {
  if (!user.value?.id) return

  // Fetch credits
  const { data: userData } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.value.id)
    .single()

  if (userData) {
    credits.value = userData.credits
  }

  // Fetch next lesson
  const { data: lessonData } = await supabase
    .from('lessons')
    .select(`
      *,
      teacher:teacher_id (
        name,
        avatar
      )
    `)
    .eq('student_id', user.value.id)
    .eq('status', 'active')
    .gte('start_time', new Date().toISOString())
    .order('start_time')
    .limit(1)
    .single()

  if (lessonData) {
    nextLesson.value = lessonData
  }
}

// Logout
const logout = async () => {
  await authStore.logout()
  router.push('/')
}

// Initial fetch
onMounted(() => {
  fetchUserData()
})
</script>