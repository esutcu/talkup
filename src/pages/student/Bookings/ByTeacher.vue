# src/pages/student/Bookings/ByTeacher.vue
<template>
  <div class="p-6 space-y-6">
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

    <!-- Öğretmen Listesi -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="teacher in teachers"
        :key="teacher.id"
        class="border rounded-lg overflow-hidden hover:border-[#3871b1] transition-colors"
      >
        <div class="p-4">
          <div class="flex items-center gap-4">
            <img 
              :src="teacher.avatar || '/default-avatar.png'" 
              alt="profil"
              class="w-16 h-16 rounded-full object-cover"
            />
            <div class="flex-1">
              <h3 class="font-medium text-[#3871b1]">{{ teacher.name }}</h3>
              <div class="mt-2 flex flex-wrap gap-2">
                <span 
                  v-for="slot in teacher.availableSlots?.slice(0, 3)"
                  :key="slot"
                  class="px-2 py-1 text-xs bg-blue-50 text-[#3871b1] rounded-full"
                >
                  {{ formatDateTime(slot) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Aksiyon Butonu -->
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

    <!-- Saat Seçim Modalı -->
    <modal-dialog v-model="showModal">
      <div class="p-6 space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium text-[#3871b1]">Müsait Saatler</h3>
          <button @click="showModal = false">
            <x-icon class="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <!-- Tarih Seçici -->
        <date-picker
          v-model="selectedDate"
          class="w-full"
          :min-date="new Date()"
          @update:model-value="fetchSlots"
        />

        <!-- Saat Seçimi -->
        <div v-if="selectedTeacher" class="grid grid-cols-4 gap-2">
          <button
            v-for="slot in availableSlots"
            :key="slot.id"
            @click="selectSlot(slot)"
            class="px-4 py-2 text-sm border rounded-lg hover:border-[#3871b1]"
          >
            {{ slot.start_time }}
          </button>
        </div>

        <!-- Onay Butonu -->
        <div class="flex justify-end">
          <button
            @click="confirmBooking"
            class="px-6 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
            :disabled="!selectedSlot"
          >
            Dersi Rezerve Et
          </button>
        </div>
      </div>
    </modal-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { X as XIcon } from 'lucide-vue-next'
import { useBookingStore } from '@/stores/booking'
import ModalDialog from '@/components/common/ModalDialog.vue'
import DatePicker from '@/components/common/DatePicker.vue'
import { formatDateTime } from '@/utils/dateTime'

const router = useRouter()
const bookingStore = useBookingStore()

// State
const teachers = ref([])
const showModal = ref(false)
const selectedTeacher = ref(null)
const selectedDate = ref(new Date())
const selectedSlot = ref(null)
const availableSlots = ref([])

// Methods
const selectTeacher = (teacher) => {
  selectedTeacher.value = teacher
  showModal.value = true
  fetchSlots()
}

const fetchSlots = async () => {
  if (!selectedTeacher.value) return
  
  const slots = await bookingStore.getAvailableSlots(
    selectedTeacher.value.id,
    selectedDate.value.toISOString().split('T')[0]
  )
  
  availableSlots.value = slots
}

const selectSlot = (slot) => {
  selectedSlot.value = slot
}

const confirmBooking = async () => {
  if (!selectedTeacher.value || !selectedSlot.value) return
  
  const booking = await bookingStore.createBooking(
    selectedTeacher.value.id,
    selectedSlot.value.id
  )
  
  if (booking) {
    router.push('/student/dashboard')
  }
}

// Initial load
onMounted(async () => {
  teachers.value = await bookingStore.getTeachers()
})
</script>