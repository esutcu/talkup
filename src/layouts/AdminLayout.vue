# src/layouts/AdminLayout.vue
<template>
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <div class="w-64 bg-white border-r">
      <div class="h-16 flex items-center px-6 border-b">
        <h1 class="text-xl font-semibold text-[#3871b1]">Admin Panel</h1>
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
  Package,
  BarChart,
  ChevronDown as ChevronDownIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const showUserMenu = ref(false)
const user = computed(() => authStore.user)

// Menu items
const menuItems = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard
  },
  {
    name: 'Paketler',
    path: '/admin/packages',
    icon: Package
  },
  {
    name: 'Günlük Rapor',
    path: '/admin/reports/daily',
    icon: BarChart
  },
  {
    name: 'Haftalık Rapor',
    path: '/admin/reports/weekly',
    icon: BarChart
  },
  {
    name: 'Aylık Rapor',
    path: '/admin/reports/monthly',
    icon: BarChart
  }
]

// Active menu item control
const isActive = (path: string) => {
  return route.path === path
}

// Current page title
const currentPageTitle = computed(() => {
  const currentItem = menuItems.find(item => isActive(item.path))
  return currentItem?.name || 'Admin Panel'
})

// Logout
const logout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>