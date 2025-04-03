<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navbar veya layout eklenebilir -->
    <router-view />

    <!-- Test Amaçlı Todo Liste -->
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">Yapılacaklar</h2>
      <ul class="space-y-2">
        <li v-for="todo in todos" :key="todo.id" class="bg-white p-3 rounded shadow">
          {{ todo.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/utils/supabase'

const authStore = useAuthStore()
const todos = ref([])

// Oturum + todo yüklemesi
onMounted(async () => {
  authStore.loadUser()
  const { data } = await supabase.from('todos').select()
  todos.value = data
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

/* Temel buton stilleri */
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
