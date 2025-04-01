# src/pages/student/Bookings/ByTime.vue
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold text-[#3871b1]">Zamana Göre Ara</h1>
      <button
        @click="$router.push('/student/bookings/by-teacher')"
        class="text-sm text-[#ff8913] hover:text-[#ff8913]/90"
      >
        Öğretmene Göre Ara
      </button>
    </div>

    <!-- Tarih ve Saat Seçimi -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Tarih Seçici -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Tarih Seç</label>
        <date-picker
          v-model="selectedDate"
          class="w-full"
          :min-date="new Date()"
        />
      </div>
      
      <!-- Saat Seçici -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Saat Seç</label>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="hour in availableHours"
            :key="hour"
            @click="selectedTime = hour"
            class="px-4 py-2 text-sm border rounded-lg"
            :class="[
              selectedTime === hour
                ? 'border-[#3871b1] bg-blue-50 text-[#3871b1]'
                : 'hover:border-gray-300'
            ]"
          >
            {{ hour }}
          </button>
        </div>
      </div>
    </div>

    <!-- Öğretmen Listesi -->
    <div v-if="selectedTime" class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="font-medium">Müsait Öğretmenler</h2>
        <div class="text-sm text-gray-500">
          {{ formatDateTime(selectedDate) }} - {{ selectedTime }}
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-8">
        <span class="text-gray-500">Öğretmenler yükleniyor...</span>
      </div>

      <div v-else-if="availableTeachers.length === 0" class="text-center py-8">
        <div class="text-gray-500">Bu saatte müsait öğretmen bulunamadı.</div>
        <button 
          @click="clearSelection"
          class="mt-4 text-sm text-[#3871b1] hover:underline"
        >
          Farklı bir saat seç
        </button>
      </div>

      <div 
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="teacher in availableTeachers"
          :key="teacher.id"
          class="border rounded-lg overflow-hidden hover:border-[#3871b1] transition-colors"
        >
          <!-- Öğretmen Kartı -->
          <div class="p-4">
            <div class="flex items-start gap-4">
              <img 
                :src="teacher.avatar" 
                alt="profil"
                class="w-16 h-16 rounded-full object-cover"
              />
              <div class="flex-1">
                <h3 class="font-medium text-[#3871b1]">{{ teacher.name }}</h3>
                <div class="mt-2">
                  <span class="px-2 py-1 text-xs bg-blue-50 text-[#3871b1] rounded-full">
                    {{ selectedTime }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Aksiyon Buttonu -->
          <div class="p-4 bg-gray-50 flex justify-end">
            <button
              @click="confirmBooking(teacher)"
              class="px-4 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
            >
              Rezervasyon Yap
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Onay Modalı -->
    <modal-dialog v-model="showConfirmModal">
      <div class="p-6 space-y-6">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-medium text-[#3871b1]">Rezervasyon Onayı</h3>
            <p class="text-sm text-gray-500 mt-1">
              {{ formatDateTime(selectedDate) }} - {{ selectedTime }}
            </p>
          </div>
          <button @click="showConfirmModal = false">
            <x-icon class="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <img 
            :src="selectedTeacher?.avatar" 
            alt="profil"
            class="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h4 class="font-medium">{{ selectedTeacher?.name }}</h4>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button
            @click="showConfirmModal = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            İptal
          </button>
          <button
            @click="createBooking"
            class="px-6 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
          >
            Onayla
          </button>
        </div>
      </div>
    </modal-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { X as XIcon } from 'lucide-vue-next'
import { useSupabase } from '@/composables/useSupabase'
import { useBookingStore } from '@/stores/booking'
import ModalDialog from '@/components/common/ModalDialog.vue'
import DatePicker from '@/components/common/DatePicker.vue'
import { formatDateTime } from '@/utils/dateTime'
import type { Teacher } from '@/types/User'

const router = useRouter()
const { supabase } = useSupabase()
const bookingStore = useBookingStore()

// State
const selectedDate = ref(new Date())
const selectedTime = ref<string | null>(null)
const availableTeachers = ref<Teacher[]>([])
const isLoading = ref(false)

// Modal state
const showConfirmModal = ref(false)
const selectedTeacher = ref<Teacher | null>(null)

// 24 saat listesi
const availableHours = computed(() => {
  const hours = []
  for (let i = 0; i < 24; i++) {
    hours.push(i.toString().padStart(2, '0') + ':00')
  }
  return hours
})

// Methods
const fetchAvailableTeachers = async () => {
  if (!selectedDate.value || !selectedTime.value) return

  isLoading.value = true
  
  const formattedDate = selectedDate.value.toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('slots')
    .select(`
      teacher:teacher_id (
        id,
        name,
        avatar
      )
    `)
    .eq('date', formattedDate)
    .eq('start_time', selectedTime.value)
    .eq('is_available', true)

  if (data && !error) {
    availableTeachers.value = data.map(slot => slot.teacher)
  }

  isLoading.value = false
}

const clearSelection = () => {
  selectedTime.value = null
  availableTeachers.value = []
}

const confirmBooking = (teacher: Teacher) => {
  selectedTeacher.value = teacher
  showConfirmModal.value = true
}

const createBooking = async () => {
  if (!selectedTeacher.value || !selectedTime.value) return

  try {
    const booking = await bookingStore.createBooking({
      teacherId: selectedTeacher.value.id,
      date: selectedDate.value,
      startTime: selectedTime.value
    })

    if (booking) {
      router.push(`/student/bookings/${booking.id}/success`)
    }
  } catch (error) {
    console.error('Booking failed:', error)
  }
}

// Watchers
watch([selectedDate, selectedTime], () => {
  if (selectedTime.value) {
    fetchAvailableTeachers()
  }
})
</script>