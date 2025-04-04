<template>
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <div class="w-64 bg-white border-r">
      <div class="h-16 flex items-center px-6 border-b">
        <h1 class="text-xl font-semibold text-[#3871b1]">{{ layoutTitle }}</h1>
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

      <!-- Öğrenci için Kredi Bilgisi -->
      <div v-if="userRole === 'student'" class="p-4 mt-4">
        <div class="p-4 bg-blue-50 rounded-lg">
          <div class="flex justify-between items-center">
            <div class="text-sm text-[#3871b1]">Kredi Bakiyeniz</div>
            <credit-card-icon class="h-5 w-5 text-[#3871b1]" />
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
        <h2 class="text-lg font-medium text-gray-800">{{ currentPageTitle }}</h2>

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

      <!-- Page Content -->
      <div class="flex-1 overflow-auto bg-gray-50 p-6">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard,
  Calendar,
  CreditCard as CreditCardIcon,
  Package,
  ChevronDown as ChevronDownIcon,
  Users
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const showUserMenu = ref(false)
const user = computed(() => authStore.user)
const userRole = computed(() => authStore.userRole)
const credits = computed(() => user.value?.credits || 0)

// Layout başlığı
const layoutTitle = computed(() => {
  switch (userRole.value) {
    case 'admin':
      return 'Admin Panel'
    case 'teacher':
      return 'Öğretmen Paneli'
    case 'student':
      return 'Öğrenci Paneli'
    default:
      return 'Panel'
  }
})

// Role göre menü itemları
const menuItems = computed(() => {
  switch (userRole.value) {
    case 'admin':
      return [
        {
          name: 'Dashboard',
          path: '/admin',
          icon: LayoutDashboard
        },
        {
          name: 'Öğretmenler',
          path: '/admin/teachers',
          icon: Users
        },
        {
          name: 'Paketler',
          path: '/admin/packages',
          icon: Package
        }
      ]
    case 'teacher':
      return [
        {
          name: 'Dashboard',
          path: '/teacher',
          icon: LayoutDashboard
        },
        {
          name: 'Müsait Saatler',
          path: '/teacher/slots',
          icon: Calendar
        }
      ]
    case 'student':
      return [
        {
          name: 'Dashboard',
          path: '/student',
          icon: LayoutDashboard
        },
        {
          name: 'Ders Al',
          path: '/student/bookings',
          icon: Calendar
        }
      ]
    default:
      return []
  }
})

// Active menu item control
const isActive = (path: string) => {
  return route.path === path
}

// Current page title
const currentPageTitle = computed(() => {
  const currentItem = menuItems.value.find(item => isActive(item.path))
  return currentItem?.name || layoutTitle.value
})

// Logout
const logout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>