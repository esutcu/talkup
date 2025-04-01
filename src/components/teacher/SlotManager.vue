# src/components/teacher/SlotManager.vue
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-[#3871b1]">Müsait Saat Yönetimi</h2>
      <div class="flex gap-2">
        <button
          @click="syncWithGoogle"
          class="px-4 py-2 text-sm bg-[#ff8913] text-white rounded-lg hover:bg-[#ff8913]/90"
        >
          Google Takvim Senkronizasyonu
        </button>
        <button
          @click="addNewSlot"
          class="px-4 py-2 text-sm bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
        >
          Yeni Saat Ekle
        </button>
      </div>
    </div>

    <!-- Tarih Seçici -->
    <div class="flex gap-4 items-center">
      <date-picker 
        v-model="selectedDate"
        class="w-full max-w-xs"
        :min-date="new Date()"
      />
      <button
        v-for="(days, label) in quickDateSelectors"
        :key="label"
        @click="addDaysToSelected(days)"
        class="px-3 py-1 text-sm rounded-full border"
        :class="[
          selectedQuickDate === label 
            ? 'border-[#3871b1] text-[#3871b1] bg-blue-50' 
            : 'border-gray-200 text-gray-600'
        ]"
      >
        {{ label }}
      </button>
    </div>

    <!-- Saat Seçim Grid -->
    <div class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
      <div
        v-for="hour in availableHours"
        :key="hour"
        class="relative"
      >
        <input
          type="checkbox"
          :id="hour"
          v-model="selectedHours[hour]"
          :disabled="isHourDisabled(hour)"
          class="peer hidden"
        />
        <label
          :for="hour"
          class="flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer 
                 peer-checked:border-[#3871b1] peer-checked:bg-blue-50 peer-checked:text-[#3871b1]
                 peer-disabled:bg-gray-100 peer-disabled:text-gray-400 peer-disabled:cursor-not-allowed"
        >
          {{ formatHour(hour) }}
        </label>
      </div>
    </div>

    <!-- Seçili Saatler Listesi -->
    <div v-if="Object.values(selectedHours).some(Boolean)" class="rounded-lg border p-4">
      <h3 class="font-medium mb-3">Seçili Saatler</h3>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="hour in getSelectedHours()"
          :key="hour"
          class="px-3 py-1 bg-blue-50 text-[#3871b1] rounded-full text-sm flex items-center gap-2"
        >
          {{ formatHour(hour) }}
          <button
            @click="selectedHours[hour] = false"
            class="text-[#3871b1] hover:text-red-500"
          >
            <x-icon class="h-4 w-4" />
          </button>
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <button
          @click="saveSelectedSlots"
          class="px-4 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
        >
          Seçili Saatleri Kaydet
        </button>
      </div>
    </div>

    <!-- Kayıtlı Müsait Saatler -->
    <div class="rounded-lg border">
      <div class="p-4 border-b">
        <h3 class="font-medium">Kayıtlı Müsait Saatler</h3>
      </div>
      <div class="p-4">
        <div v-if="savedSlots.length === 0" class="text-center text-gray-500 py-8">
          Henüz kayıtlı müsait saat bulunmuyor
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="slot in savedSlots"
            :key="slot.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <div class="font-medium text-[#3871b1]">
                {{ formatDate(slot.date) }}
              </div>
              <div class="text-sm text-gray-500">
                {{ formatHour(slot.startTime) }}
              </div>
            </div>
            <button
              v-if="!slot.isBooked"
              @click="deleteSlot(slot.id)"
              class="text-gray-400 hover:text-red-500"
            >
              <trash-icon class="h-5 w-5" />
            </button>
            <div
              v-else
              class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              Rezerve Edildi
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { X as XIcon, Trash as TrashIcon } from 'lucide-vue-next'
import { useSupabase } from '@/composables/useSupabase'
import { useGoogleCalendar } from '@/composables/useGoogleCalendar'
import DatePicker from '@/components/common/DatePicker.vue'
import type { Slot } from '@/types/Slot'
import { formatDate, formatHour } from '@/utils/dateTime'

const { supabase } = useSupabase()
const { syncCalendar } = useGoogleCalendar()

// State
const selectedDate = ref(new Date())
const selectedHours = ref<Record<string, boolean>>({})
const savedSlots = ref<Slot[]>([])

// Quick date selectors
const quickDateSelectors = {
  'Bugün': 0,
  'Yarın': 1,
  'Gelecek Hafta': 7,
  '2 Hafta': 14,
}
const selectedQuickDate = ref<string | null>(null)

// Tüm saatler (00:00 - 23:00)
const availableHours = computed(() => {
  const hours = []
  for (let i = 0; i < 24; i++) {
    hours.push(i.toString().padStart(2, '0') + ':00')
  }
  return hours
})

// Methods
const syncWithGoogle = async () => {
  await syncCalendar()
  await fetchSavedSlots()
}

const addDaysToSelected = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  selectedDate.value = date
}

const isHourDisabled = (hour: string) => {
  // Sadece geçmiş saatleri disable et
  const now = new Date()
  const slotDate = new Date(selectedDate.value)
  const [slotHour] = hour.split(':')
  slotDate.setHours(parseInt(slotHour), 0, 0, 0)
  
  return slotDate < now
}

const getSelectedHours = () => {
  return Object.entries(selectedHours.value)
    .filter(([_, isSelected]) => isSelected)
    .map(([hour]) => hour)
}

const saveSelectedSlots = async () => {
  const selectedTimeSlots = getSelectedHours()
  
  const slots = selectedTimeSlots.map(time => ({
    teacher_id: 'current_teacher_id', // Aktif öğretmen ID'si
    date: selectedDate.value.toISOString().split('T')[0],
    start_time: time,
    is_available: true
  }))

  const { error } = await supabase
    .from('slots')
    .insert(slots)

  if (!error) {
    selectedHours.value = {}
    await fetchSavedSlots()
  }
}

const deleteSlot = async (slotId: string) => {
  const { error } = await supabase
    .from('slots')
    .delete()
    .eq('id', slotId)

  if (!error) {
    await fetchSavedSlots()
  }
}

const fetchSavedSlots = async () => {
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date')
    .order('start_time')

  if (data && !error) {
    savedSlots.value = data
  }
}

// Initial load
fetchSavedSlots()
</script>