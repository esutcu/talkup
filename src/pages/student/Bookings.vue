<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold text-[#3871b1]">Ders Rezervasyonu</h1>
    </div>

    <!-- Tarih Seçimi -->
    <div class="bg-white rounded-lg border p-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Tarih Seçin</label>
      <input
        type="date"
        v-model="selectedDate"
        class="w-full px-4 py-2 border rounded-lg"
        :min="today"
      />
    </div>

    <!-- Öğretmen Listesi -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="teacher in availableTeachers"
        :key="teacher.id"
        class="bg-white border rounded-lg overflow-hidden"
      >
        <!-- Öğretmen Bilgisi -->
        <div class="p-4">
          <div class="flex items-center gap-4">
            <img 
              :src="teacher.avatar || '/default-avatar.png'" 
              alt="profil"
              class="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 class="font-medium text-[#3871b1]">{{ teacher.name }}</h3>
            </div>
          </div>

          <!-- Müsait Saatler -->
          <div class="mt-4 grid grid-cols-3 gap-2">
            <button
              v-for="slot in teacher.slots"
              :key="slot.id"
              @click="selectSlot(teacher, slot)"
              class="px-3 py-2 text-sm border rounded-lg hover:border-[#3871b1]"
              :class="selectedSlot?.id === slot.id ? 'bg-[#3871b1] text-white' : ''"
            >
              {{ slot.start_time }}
            </button>
          </div>
        </div>

        <!-- Rezervasyon Butonu -->
        <div class="p-4 bg-gray-50 border-t">
          <button
            @click="bookLesson(teacher)"
            class="w-full px-4 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
            :disabled="!canBook(teacher)"
          >
            {{ getBookButtonText(teacher) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/stores/auth'
import { formatDateTime } from '@/utils/dateTime'

const router = useRouter()
const { supabase } = useSupabase()
const authStore = useAuthStore()

// State
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedSlot = ref(null)
const availableTeachers = ref([])

// Computed
const today = computed(() => new Date().toISOString().split('T')[0])
const hasEnoughCredits = computed(() => (authStore.user?.credits || 0) >= 1)

// Methods
const fetchTeachers = async () => {
  const { data: teachers } = await supabase
    .from('users')
    .select('id, name, avatar')
    .eq('role', 'teacher')
    .eq('status', 'active')

  if (teachers) {
    // Her öğretmen için müsait saatleri al
    const teachersWithSlots = await Promise.all(
      teachers.map(async (teacher) => {
        const { data: slots } = await supabase
          .from('slots')
          .select('*')
          .eq('teacher_id', teacher.id)
          .eq('date', selectedDate.value)
          .eq('is_booked', false)
          .order('start_time')

        return {
          ...teacher,
          slots: slots || []
        }
      })
    )

    availableTeachers.value = teachersWithSlots.filter(t => t.slots.length > 0)
  }
}

const selectSlot = (teacher, slot) => {
  selectedSlot.value = slot
}

const canBook = (teacher) => {
  return hasEnoughCredits.value && selectedSlot.value
}

const getBookButtonText = (teacher) => {
  if (!hasEnoughCredits.value) return 'Yetersiz Kredi'
  if (!selectedSlot.value) return 'Saat Seçin'
  return 'Rezervasyon Yap'
}

const bookLesson = async (teacher) => {
  if (!canBook(teacher)) return

  const meetId = Math.random().toString(36).substring(7)
  const meetLink = `https://meet.google.com/${meetId}`

  const { error } = await supabase.rpc('create_booking', {
    p_student_id: authStore.user.id,
    p_teacher_id: teacher.id,
    p_slot_id: selectedSlot.value.id,
    p_meet_link: meetLink
  })

  if (!error) {
    router.push('/student/dashboard')
  }
}

// Tarih değişince öğretmenleri yeniden yükle
watch(selectedDate, () => {
  fetchTeachers()
})

// İlk yükleme
onMounted(() => {
  fetchTeachers()
})
</script>