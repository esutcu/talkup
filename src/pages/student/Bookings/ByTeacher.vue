# src/pages/student/Bookings/ByTeacher.vue
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold text-[#3871b1]">Öğretmen Seç</h1>
      <button
        @click="$router.push('/student/bookings/by-time')"
        class="text-sm text-[#ff8913] hover:text-[#ff8913]/90"
      >
        Saate Göre Ara
      </button>
    </div>

    <!-- Öğretmen Filtreleme -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Arama -->
      <div class="relative">
        <search-icon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Öğretmen ara..."
          class="pl-10 pr-4 py-2 w-full border rounded-lg"
        />
      </div>

      <!-- Müsaitlik Filtresi -->
      <div>
        <select 
          v-model="availabilityFilter"
          class="w-full px-4 py-2 border rounded-lg"
        >
          <option value="">Müsaitlik</option>
          <option value="today">Bugün Müsait</option>
          <option value="week">Bu Hafta Müsait</option>
          <option value="any">Tümü</option>
        </select>
      </div>
    </div>

    <!-- Öğretmen Listesi -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="teacher in filteredTeachers"
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
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <span 
                  v-for="(slot, index) in teacher.nextAvailableSlots.slice(0, 3)"
                  :key="index"
                  class="px-2 py-1 text-xs bg-blue-50 text-[#3871b1] rounded-full"
                >
                  {{ formatDateTime(slot) }}
                </span>
                <span v-if="teacher.nextAvailableSlots.length > 3" class="text-xs text-gray-500">
                  +{{ teacher.nextAvailableSlots.length - 3 }} müsait saat
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Aksiyon Buttonu -->
        <div class="p-4 bg-gray-50 flex justify-end">
          <button
            @click="selectTeacher(teacher)"
            class="px-4 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
          >
            Müsait Saatleri Gör
          </button>
        </div>
      </div>
    </div>

    <!-- Öğretmen Seçim Modalı -->
    <modal-dialog v-model="showTeacherModal">
      <div class="p-6 space-y-6">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-medium text-[#3871b1]">
              {{ selectedTeacher?.name }}
            </h3>
            <p class="text-sm text-gray-500">Müsait Saatler</p>
          </div>
          <button @click="showTeacherModal = false">
            <x-icon class="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <!-- Tarih Seçici -->
        <date-picker
          v-model="selectedDate"
          class="w-full"
          :min-date="new Date()"
        />

        <!-- Saat Seçimi -->
        <div v-if="selectedTeacher" class="grid grid-cols-4 gap-2">
          <button
            v-for="slot in selectedTeacher.availableSlots"
            :key="slot"
            @click="selectTimeSlot(slot)"
            class="px-4 py-2 text-sm border rounded-lg"
            :class="[
              selectedSlot === slot
                ? 'border-[#3871b1] bg-blue-50 text-[#3871b1]'
                : 'hover:border-gray-300'
            ]"
          >
            {{ formatTime(slot) }}
          </button>
        </div>

        <!-- Onay Butonu -->
        <div class="flex justify-end">
          <button
            @click="confirmBooking"
            :disabled="!selectedSlot"
            class="px-6 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90 disabled:opacity-50"
          >
            Dersi Rezerve Et
          </button>
        </div>
      </div>
    </modal-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search as SearchIcon, X as XIcon } from 'lucide-vue-next'
import { useSupabase } from '@/composables/useSupabase'
import { useBookingStore } from '@/stores/booking'
import ModalDialog from '@/components/common/ModalDialog.vue'
import DatePicker from '@/components/common/DatePicker.vue'
import { formatDateTime, formatTime } from '@/utils/dateTime'
import type { Teacher } from '@/types/User'

const router = useRouter()
const { supabase } = useSupabase()
const bookingStore = useBookingStore()

// Filtreleme state
const searchQuery = ref('')
const availabilityFilter = ref('')

// Modal state
const showTeacherModal = ref(false)
const selectedTeacher = ref<Teacher | null>(null)
const selectedDate = ref(new Date())
const selectedSlot = ref<string | null>(null)

// Data
const teachers = ref<Teacher[]>([])

// Computed
const filteredTeachers = computed(() => {
  let filtered = teachers.value

  // İsim araması
  if (searchQuery.value) {
    filtered = filtered.filter(teacher => 
      teacher.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Müsaitlik filtresi
  if (availabilityFilter.value) {
    const now = new Date()
    filtered = filtered.filter(teacher => {
      if (availabilityFilter.value === 'today') {
        return teacher.nextAvailableSlots.some(slot => {
          const slotDate = new Date(slot)
          return slotDate.getDate() === now.getDate()
        })
      }
      if (availabilityFilter.value === 'week') {
        const weekFromNow = new Date(now)
        weekFromNow.setDate(weekFromNow.getDate() + 7)
        return teacher.nextAvailableSlots.some(slot => {
          const slotDate = new Date(slot)
          return slotDate <= weekFromNow
        })
      }
      return true
    })
  }

  return filtered
})

// Methods
const fetchTeachers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      slots (
        start_time,
        date
      )
    `)
    .eq('role', 'teacher')
    .eq('status', 'active')

  if (data && !error) {
    teachers.value = data.map(teacher => ({
      ...teacher,
      nextAvailableSlots: teacher.slots
        .filter(slot => new Date(slot.date + ' ' + slot.start_time) > new Date())
        .map(slot => slot.date + ' ' + slot.start_time)
        .sort()
    }))
  }
}

const selectTeacher = (teacher: Teacher) => {
  selectedTeacher.value = teacher
  showTeacherModal.value = true
  selectedDate.value = new Date()
  selectedSlot.value = null
}

const selectTimeSlot = (slot: string) => {
  selectedSlot.value = slot
}

const confirmBooking = async () => {
  if (!selectedTeacher.value || !selectedSlot.value) return

  try {
    const booking = await bookingStore.createBooking({
      teacherId: selectedTeacher.value.id,
      date: selectedDate.value,
      startTime: selectedSlot.value
    })

    if (booking) {
      router.push(`/student/bookings/${booking.id}/success`)
    }
  } catch (error) {
    console.error('Booking failed:', error)
  }
}

// Initial load
fetchTeachers()
</script>