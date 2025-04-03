<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold text-[#3871b1]">Müsait Saatler</h1>
    </div>

    <!-- Tarih Seçici -->
    <div class="bg-white rounded-lg border p-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Tarih Seçin</label>
      <input 
        type="date" 
        v-model="selectedDate"
        class="w-full px-4 py-2 border rounded-lg"
        :min="today"
      />
    </div>

    <!-- Saat Seçici -->
    <div class="bg-white rounded-lg border p-4">
      <label class="block text-sm font-medium text-gray-700 mb-4">Müsait Saatler</label>
      
      <div class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        <button
          v-for="hour in availableHours"
          :key="hour"
          @click="toggleTimeSlot(hour)"
          class="px-4 py-2 text-sm border rounded-lg"
          :class="isSlotSelected(hour) ? 'bg-[#3871b1] text-white' : ''"
        >
          {{ formatHour(hour) }}
        </button>
      </div>

      <div class="mt-4 flex justify-end">
        <button
          @click="saveSlots"
          class="px-6 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
        >
          Kaydet
        </button>
      </div>
    </div>

    <!-- Kayıtlı Saatler -->
    <div class="bg-white rounded-lg border">
      <div class="p-4 border-b">
        <h2 class="font-medium">Kayıtlı Saatler</h2>
      </div>
      <div class="p-4">
        <div class="space-y-3">
          <div
            v-for="slot in savedSlots"
            :key="slot.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <div class="font-medium">{{ formatDate(slot.date) }}</div>
              <div class="text-sm text-gray-500">{{ slot.start_time }}</div>
            </div>
            <div class="flex items-center gap-2">
              <div v-if="slot.is_booked" class="text-sm text-green-600">
                Rezerve Edildi
              </div>
              <button
                v-else
                @click="deleteSlot(slot.id)"
                class="text-red-500 hover:text-red-700"
              >
                <trash-icon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Trash as TrashIcon } from 'lucide-vue-next'
import { useSupabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/utils/dateTime'

const { supabase } = useSupabase()
const authStore = useAuthStore()

// State
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedTimes = ref(new Set())
const savedSlots = ref([])

// Computed
const today = computed(() => new Date().toISOString().split('T')[0])

const availableHours = computed(() => {
  return Array.from({ length: 24 }, (_, i) => i)
})

// Methods
const formatHour = (hour: number) => {
  return `${hour.toString().padStart(2, '0')}:00`
}

const isSlotSelected = (hour: number) => {
  return selectedTimes.value.has(hour)
}

const toggleTimeSlot = (hour: number) => {
  if (selectedTimes.value.has(hour)) {
    selectedTimes.value.delete(hour)
  } else {
    selectedTimes.value.add(hour)
  }
}

const saveSlots = async () => {
  if (!authStore.user?.id) return
  
  const slots = Array.from(selectedTimes.value).map(hour => ({
    teacher_id: authStore.user.id,
    date: selectedDate.value,
    start_time: formatHour(hour),
    is_booked: false
  }))

  await supabase.from('slots').insert(slots)
  await fetchSavedSlots()
  selectedTimes.value.clear()
}

const deleteSlot = async (slotId: string) => {
  await supabase
    .from('slots')
    .delete()
    .eq('id', slotId)
  
  await fetchSavedSlots()
}

const fetchSavedSlots = async () => {
  const { data } = await supabase
    .from('slots')
    .select('*')
    .eq('teacher_id', authStore.user?.id)
    .gte('date', today.value)
    .order('date')
    .order('start_time')

  if (data) {
    savedSlots.value = data
  }
}

// Initial load
onMounted(() => {
  fetchSavedSlots()
})
</script>