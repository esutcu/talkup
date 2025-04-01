# src/layouts/TeacherLayout.vue
<template>
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <div class="w-64 bg-white border-r">
      <div class="h-16 flex items-center px-6 border-b">
        <h1 class="text-xl font-semibold text-[#3871b1]">Öğretmen Paneli</h1>
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
          <!-- Upcoming Class Indicator -->
          <div v-if="nextLesson" class="text-sm">
            <span class="text-gray-500">Sonraki Ders:</span>
            <span class="ml-2 font-medium">{{ formatTime(nextLesson.startTime) }}</span>
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
import {
  LayoutDashboard,
  Calendar,
  ChevronDown as ChevronDownIcon
} from 'lucide-vue-next'
import { formatTime } from '@/utils/dateTime'
import type { Lesson } from '@/types/Booking'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { supabase } = useSupabase()

const showUserMenu = ref(false)
const user = computed(() => authStore.user)
const nextLesson = ref<Lesson | null>(null)

// Menu items
const menuItems = [
  {
    name: 'Dashboard',
    path: '/teacher',
    icon: LayoutDashboard
  },
  {
    name: 'Müsait Saatler',
    path: '/teacher/calendar/slots',
    icon: Calendar
  },
  {
    name: 'Takvim Senkronizasyonu',
    path: '/teacher/calendar/sync',
    icon: Calendar
  }
]

// Active menu item control
const isActive = (path: string) => {
  return route.path === path
}

// Current page title
const currentPageTitle = computed(() => {
  const currentItem = menuItems.find(item => isActive(item.path))
  return currentItem?.name || 'Öğretmen Paneli'
})

// Fetch next lesson
const fetchNextLesson = async () => {
  if (!user.value?.id) return

  const { data } = await supabase
    .from('lessons')
    .select('*')
    .eq('teacher_id', user.value.id)
    .eq('status', 'active')
    .gte('start_time', new Date().toISOString())
    .order('start_time')
    .limit(1)
    .single()

  if (data) {
    nextLesson.value = data
  }
}

// Logout
const logout = async () => {
  await authStore.logout()
  router.push('/')
}

// Initial fetch
onMounted(() => {
  fetchNextLesson()
})
</script>