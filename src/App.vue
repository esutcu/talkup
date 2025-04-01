<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Sayfa yüklendiğinde oturum durumunu kontrol et
onMounted(() => {
  authStore.loadUser()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  display: flex;
  flex-direction: column;
}

.btn-primary {
  @apply px-4 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90;
}

.btn-secondary {
  @apply px-4 py-2 bg-[#ff8913] text-white rounded-lg hover:bg-[#ff8913]/90;
}

.btn-outline {
  @apply px-4 py-2 border border-[#3871b1] text-[#3871b1] rounded-lg hover:bg-[#3871b1] hover:text-white;
}
</style>