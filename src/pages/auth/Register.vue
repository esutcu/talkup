<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Header -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-[#3871b1]">
            Kayıt Ol
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
  
            <!-- Role Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Hesap Türü
              </label>
              <div class="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  @click="role = 'student'"
                  class="p-4 border rounded-lg text-center"
                  :class="role === 'student' ? 'border-[#3871b1] bg-blue-50 text-[#3871b1]' : ''"
                >
                  <user-icon class="h-6 w-6 mx-auto mb-2" />
                  <span class="block font-medium">Öğrenci</span>
                </button>
  
                <button
                  type="button"
                  @click="role = 'teacher'"
                  class="p-4 border rounded-lg text-center"
                  :class="role === 'teacher' ? 'border-[#3871b1] bg-blue-50 text-[#3871b1]' : ''"
                >
                  <book-icon class="h-6 w-6 mx-auto mb-2" />
                  <span class="block font-medium">Öğretmen</span>
                </button>
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
              :disabled="isLoading || !role"
            >
              {{ isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { User as UserIcon, Book as BookIcon } from 'lucide-vue-next'
  
  const router = useRouter()
  const authStore = useAuthStore()
  
  const name = ref('')
  const email = ref('')
  const password = ref('')
  const role = ref('')
  const error = ref('')
  const isLoading = ref(false)
  
  const handleSubmit = async () => {
    if (!role.value) {
      error.value = 'Lütfen hesap türü seçin'
      return
    }
  
    error.value = ''
    isLoading.value = true
  
    try {
      const success = await authStore.register(email.value, password.value, role.value)
      
      if (success) {
        // Kullanıcı rolüne göre yönlendirme
        switch (role.value) {
          case 'teacher':
            router.push('/teacher')
            break
          case 'student':
            router.push('/student')
            break
          default:
            router.push('/')
        }
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
  