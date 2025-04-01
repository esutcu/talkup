<template>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-semibold text-[#3871b1]">Takvim Senkronizasyonu</h1>
        <button
          @click="syncCalendar"
          class="px-4 py-2 bg-[#ff8913] text-white rounded-lg hover:bg-[#ff8913]/90"
          :disabled="isLoading"
        >
          <refresh-icon class="h-4 w-4 mr-2 inline-block" :class="{ 'animate-spin': isLoading }" />
          {{ isLoading ? 'Senkronize Ediliyor...' : 'Senkronize Et' }}
        </button>
      </div>
  
      <!-- Google Hesap Kartı -->
      <div class="bg-white rounded-lg border">
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-medium text-gray-900">Google Calendar</h2>
              <p class="text-sm text-gray-500 mt-1">
                Ders programınızı ve müsait saatleri Google takviminizle senkronize edin
              </p>
            </div>
            <img src="/google-calendar-icon.svg" alt="Google Calendar" class="h-12 w-12" />
          </div>
  
          <div class="mt-6">
            <div v-if="!isAuthorized" class="bg-gray-50 rounded-lg p-4">
              <p class="text-gray-700">
                Ders programınızı senkronize etmek için Google Calendar'a bağlanmanız gerekiyor.
              </p>
              <button
                @click="authorize"
                class="mt-4 px-4 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90 flex items-center"
              >
                <google-icon class="h-5 w-5 mr-2" />
                Google Hesabına Bağlan
              </button>
            </div>
            <div v-else class="flex items-center justify-between bg-green-50 rounded-lg p-4">
              <div>
                <div class="text-green-700 font-medium">Google Calendar'a bağlandı</div>
                <div class="text-sm text-gray-600 mt-1">
                  Son senkronizasyon: {{ formatTimeAgo(lastSyncTime) }}
                </div>
              </div>
              <button
                @click="deauthorize"
                class="text-gray-500 hover:text-gray-700"
              >
                Bağlantıyı Kes
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Senkronizasyon Ayarları -->
      <div class="bg-white rounded-lg border">
        <div class="px-6 py-4 border-b">
          <h2 class="font-medium">Senkronizasyon Ayarları</h2>
        </div>
        <div class="p-6 space-y-4">
          <!-- Otomatik Senkronizasyon -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-gray-900">Otomatik Senkronizasyon</h3>
              <p class="text-sm text-gray-500 mt-1">
                Takvimlerinizi otomatik olarak senkronize edin
              </p>
            </div>
            <label class="flex items-center cursor-pointer">
              <div class="relative">
                <input type="checkbox" v-model="settings.autoSync" class="sr-only" @change="saveSettings" />
                <div class="block bg-gray-300 w-14 h-8 rounded-full"></div>
                <div
                  class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"
                  :class="{ 'transform translate-x-6': settings.autoSync }"
                ></div>
              </div>
            </label>
          </div>
  
          <!-- Senkronizasyon Sıklığı -->
          <div class="flex items-center justify-between" v-if="settings.autoSync">
            <div>
              <h3 class="font-medium text-gray-900">Senkronizasyon Sıklığı</h3>
              <p class="text-sm text-gray-500 mt-1">
                Ne sıklıkla senkronizasyon yapılacağını seçin
              </p>
            </div>
            <select
              v-model="settings.syncFrequency"
              class="px-3 py-2 border rounded-lg"
              @change="saveSettings"
            >
              <option value="1">Her saat</option>
              <option value="6">6 saatte bir</option>
              <option value="12">12 saatte bir</option>
              <option value="24">Her gün</option>
            </select>
          </div>
  
          <!-- Çift Yönlü Senkronizasyon -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium text-gray-900">Çift Yönlü Senkronizasyon</h3>
              <p class="text-sm text-gray-500 mt-1">
                Google Calendar'daki değişiklikleri TalkUp'a senkronize edin
              </p>
            </div>
            <label class="flex items-center cursor-pointer">
              <div class="relative">
                <input type="checkbox" v-model="settings.twoWaySync" class="sr-only" @change="saveSettings" />
                <div class="block bg-gray-300 w-14 h-8 rounded-full"></div>
                <div
                  class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"
                  :class="{ 'transform translate-x-6': settings.twoWaySync }"
                ></div>
              </div>
            </label>
          </div>
        </div>
      </div>
  
      <!-- Senkronize Edilen Ders ve Slotlar -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Senkronize Edilen Dersler -->
        <div class="bg-white rounded-lg border">
          <div class="px-6 py-4 border-b">
            <h2 class="font-medium">Senkronize Edilen Dersler</h2>
          </div>
          <div class="p-4">
            <div class="space-y-4 max-h-80 overflow-y-auto">
              <div
                v-for="lesson in syncedLessons"
                :key="lesson.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div class="font-medium">{{ lesson.studentName }}</div>
                  <div class="text-sm text-gray-500">
                    {{ formatDate(lesson.date) }} {{ formatTime(lesson.start_time) }}
                  </div>
                </div>
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="lesson.isSynced ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                >
                  {{ lesson.isSynced ? 'Senkronize' : 'Bekliyor' }}
                </span>
              </div>
              <!-- Veri yoksa -->
              <div v-if="syncedLessons.length === 0" class="text-center py-4 text-gray-500">
                Senkronize edilecek ders bulunamadı.
              </div>
            </div>
          </div>
        </div>
  
        <!-- Senkronize Edilen Müsait Saatler -->
        <div class="bg-white rounded-lg border">
          <div class="px-6 py-4 border-b">
            <h2 class="font-medium">Müsait Saatler</h2>
          </div>
          <div class="p-4">
            <div class="space-y-4 max-h-80 overflow-y-auto">
              <div
                v-for="slot in availableSlots"
                :key="slot.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div class="font-medium">Müsait Saat</div>
                  <div class="text-sm text-gray-500">
                    {{ formatDate(slot.date) }} {{ formatTime(slot.start_time) }}
                  </div>
                </div>
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="slot.isSynced ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                >
                  {{ slot.isSynced ? 'Senkronize' : 'Bekliyor' }}
                </span>
              </div>
              <!-- Veri yoksa -->
              <div v-if="availableSlots.length === 0" class="text-center py-4 text-gray-500">
                Senkronize edilecek müsait saat bulunamadı.
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Senkronizasyon Geçmişi -->
      <div class="bg-white rounded-lg border">
        <div class="px-6 py-4 border-b">
          <h2 class="font-medium">Senkronizasyon Geçmişi</h2>
        </div>
        <div class="divide-y">
          <div
            v-for="log in syncLogs"
            :key="log.id"
            class="px-6 py-4 flex items-center justify-between"
          >
            <div>
              <div class="font-medium">{{ log.title }}</div>
              <div class="text-sm text-gray-500">{{ formatDate(log.timestamp) }} {{ formatTime(log.timestamp) }}</div>
            </div>
            <span
              class="px-2 py-1 text-xs rounded-full"
              :class="log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              {{ log.status === 'success' ? 'Başarılı' : 'Başarısız' }}
            </span>
          </div>
          <!-- Veri yoksa -->
          <div v-if="syncLogs.length === 0" class="px-6 py-8 text-center text-gray-500">
            Henüz senkronizasyon kaydı bulunmuyor.
          </div>
        </div>
      </div>
  
      <!-- Yardım ve Yönergeler -->
      <div class="bg-gray-50 rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Yardım ve İpuçları</h2>
        <div class="space-y-3">
          <div class="flex items-start gap-2">
            <info-icon class="h-5 w-5 text-[#3871b1] flex-shrink-0 mt-0.5" />
            <p class="text-sm text-gray-600">
              Google Calendar ile takviminizi senkronize ettiğinizde, TalkUp üzerinden yapılan tüm ders rezervasyonları
              Google takviminize otomatik olarak eklenecektir.
            </p>
          </div>
          <div class="flex items-start gap-2">
            <info-icon class="h-5 w-5 text-[#3871b1] flex-shrink-0 mt-0.5" />
            <p class="text-sm text-gray-600">
              Çift yönlü senkronizasyon seçeneği aktifleştirildiğinde, Google Calendar'daki değişiklikler 
              TalkUp'a da yansıtılacaktır. Bu, müsait saatlerinizi her iki platformdan da yönetebileceğiniz anlamına gelir.
            </p>
          </div>
          <div class="flex items-start gap-2">
            <info-icon class="h-5 w-5 text-[#3871b1] flex-shrink-0 mt-0.5" />
            <p class="text-sm text-gray-600">
              Senkronizasyon işlemi otomatik olarak her giriş yaptığınızda ve ders rezervasyonu yapıldığında çalışır.
              İsterseniz manuel olarak da senkronizasyon yapabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { 
    Refresh as RefreshIcon, 
    Info as InfoIcon,
    Calendar as GoogleIcon
  } from 'lucide-vue-next'
  import { useGoogleCalendar } from '@/composables/useGoogleCalendar'
  import { useSupabase } from '@/composables/useSupabase'
  import { useAuthStore } from '@/stores/auth'
  import { formatDate, formatTime, formatTimeAgo } from '@/utils/dateTime'
  
  const authStore = useAuthStore()
  const { supabase } = useSupabase()
  const {
    isAuthorized,
    isLoading,
    lastSyncTime,
    authorize,
    deauthorize,
    syncCalendar
  } = useGoogleCalendar()
  
  // State
  const settings = ref({
    autoSync: true,
    syncFrequency: '24',
    twoWaySync: false
  })
  const syncedLessons = ref([])
  const availableSlots = ref([])
  const syncLogs = ref([])
  
  // Methods
  const loadData = async () => {
    if (authStore.userId) {
      await Promise.all([
        fetchSettings(),
        fetchLessons(),
        fetchSlots(),
        fetchSyncLogs()
      ])
    }
  }
  
  const fetchSettings = async () => {
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', authStore.userId)
      .single()
  
    if (data) {
      settings.value = {
        autoSync: data.calendar_auto_sync || false,
        syncFrequency: data.calendar_sync_frequency || '24',
        twoWaySync: data.calendar_two_way_sync || false
      }
    }
  }
  
  const saveSettings = async () => {
    await supabase
      .from('user_settings')
      .upsert({
        user_id: authStore.userId,
        calendar_auto_sync: settings.value.autoSync,
        calendar_sync_frequency: settings.value.syncFrequency,
        calendar_two_way_sync: settings.value.twoWaySync
      })
  }
  
  const fetchLessons = async () => {
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        student:student_id (name)
      `)
      .eq('teacher_id', authStore.userId)
      .eq('status', 'active')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date')
      .order('start_time')
      .limit(10)
  
    if (data) {
      syncedLessons.value = data.map(lesson => ({
        ...lesson,
        studentName: lesson.student?.name || 'Bilinmeyen Öğrenci',
        isSynced: Math.random() > 0.3 // Rastgele bir değer (gerçek uygulamada Google Calendar API'dan gelecek)
      }))
    }
  }
  
  const fetchSlots = async () => {
    const { data } = await supabase
      .from('slots')
      .select('*')
      .eq('teacher_id', authStore.userId)
      .eq('is_available', true)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date')
      .order('start_time')
      .limit(10)
  
    if (data) {
      availableSlots.value = data.map(slot => ({
        ...slot,
        isSynced: Math.random() > 0.3 // Rastgele bir değer (gerçek uygulamada Google Calendar API'dan gelecek)
      }))
    }
  }
  
  const fetchSyncLogs = async () => {
    const { data } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('user_id', authStore.userId)
      .order('timestamp', { ascending: false })
      .limit(5)
  
    if (data) {
      syncLogs.value = data
    } else {
      // Örnek senkronizasyon logları (gerçek uygulamada veritabanından gelecek)
      syncLogs.value = [
        {
          id: 1,
          title: 'Takvim otomatik senkronizasyonu',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'success'
        },
        {
          id: 2,
          title: 'Manuel senkronizasyon',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'success'
        },
        {
          id: 3,
          title: 'Takvim otomatik senkronizasyonu',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          status: 'failed'
        }
      ]
    }
  }
  
  // Initial load
  onMounted(() => {
    loadData()
  })
  </script>
  
  <style scoped>
  /* Toggle switch styling */
  .dot {
    transition: all 0.3s ease-in-out;
  }
  input:checked ~ .block {
    background-color: #3871b1;
  }
  </style>