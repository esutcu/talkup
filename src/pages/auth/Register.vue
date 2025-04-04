# src/pages/auth/Register.vue
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-3xl font-bold text-[#3871b1]">
          Öğrenci Kaydı
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Zaten hesabınız var mı?
          <router-link to="/login" class="text-[#3871b1] hover:text-[#3871b1]/80 font-medium">
            Giriş Yap
          </router-link>
        </p>
      </div>

      <!-- Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Ad Soyad -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Ad Soyad
            </label>
            <div class="mt-1">
              <input
                id="name"
                v-model="name"
                type="text"
                required
                class="form-input"
                :class="{ 'border-red-300': error }"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              E-posta
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="form-input"
                :class="{ 'border-red-300': error }"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Şifre
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="form-input"
                :class="{ 'border-red-300': error }"
              />
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-sm text-red-600">
          {{ error }}
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            class="w-full btn-primary"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol' }}
          </button>
        </div>

        <!-- Info Text -->
        <p class="text-sm text-gray-500 text-center">
          Kaydolarak <router-link to="/terms" class="text-[#3871b1] hover:underline">kullanım şartlarını</router-link> ve
          <router-link to="/privacy" class="text-[#3871b1] hover:underline">gizlilik politikasını</router-link> kabul etmiş olursunuz.
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  isLoading.value = true

  try {
    // 'student' rolü otomatik olarak atanıyor
    const success = await authStore.register(email.value, password.value, name.value)
    
    if (success) {
      router.push('/student')
    } else {
      error.value = 'Kayıt yapılırken bir hata oluştu'
    }
  } catch (err) {
    error.value = 'Kayıt yapılırken bir hata oluştu'
  } finally {
    isLoading.value = false
  }
}
</script>