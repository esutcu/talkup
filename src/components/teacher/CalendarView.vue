# src/components/teacher/CalendarView.vue
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <h2 class="text-xl font-semibold text-[#3871b1]">Ders Programı</h2>
        <span 
          v-if="isLoading" 
          class="text-sm text-gray-500"
        >Yükleniyor...</span>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 text-sm">
          <span class="w-3 h-3 rounded-full bg-[#3871b1]"></span>
          <span>Müsait</span>
          <span class="w-3 h-3 rounded-full bg-[#ff8913]"></span>
          <span>Rezerve</span>
        </div>
        <button
          @click="today"
          class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Bugün
        </button>
      </div>
    </div>

    <!-- Takvim Navigasyon -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <button
          @click="previousMonth"
          class="p-1 rounded-full hover:bg-gray-100"
        >
          <chevron-left-icon class="h-5 w-5" />
        </button>
        <h3 class="text-lg font-medium">
          {{ formatMonth(currentDate) }}
        </h3>
        <button
          @click="nextMonth"
          class="p-1 rounded-full hover:bg-gray-100"
        >
          <chevron-right-icon class="h-5 w-5" />
        </button>
      </div>
      <div class="flex gap-2">
        <button
          v-for="view in viewOptions"
          :key="view"
          @click="currentView = view"
          class="px-3 py-1 text-sm rounded-lg"
          :class="[
            currentView === view 
              ? 'bg-[#3871b1] text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ view }}
        </button>
      </div>
    </div>

    <!-- Ay Görünümü -->
    <div v-if="currentView === 'Ay'" class="border rounded-lg">
      <!-- Hafta Günleri -->
      <div class="grid grid-cols-7 border-b">
        <div
          v-for="day in weekDays"
          :key="day"
          class="py-2 text-center text-sm font-medium text-gray-500"
        >
          {{ day }}
        </div>
      </div>

      <!-- Takvim Günleri -->
      <div class="grid grid-cols-7">
        <div
          v-for="date in calendarDays"
          :key="date.toISOString()"
          class="min-h-[120px] p-2 border-b border-r relative"
          :class="{
            'bg-gray-50': !isSameMonth(date, currentDate),
            'bg-blue-50': isToday(date)
          }"
        >
          <!-- Gün -->
          <div class="text-sm mb-2" :class="{'text-gray-400': !isSameMonth(date, currentDate)}">
            {{ date.getDate() }}
          </div>

          <!-- O Güne Ait Slotlar -->
          <div class="space-y-1">
            <div
              v-for="slot in getSlotsForDate(date)"
              :key="slot.id"
              class="text-xs p-1 rounded truncate"
              :class="[
                slot.isBooked 
                  ? 'bg-[#ff8913] text-white' 
                  : 'bg-[#3871b1] text-white'
              ]"
              :title="getSlotTitle(slot)"
            >
              {{ formatHour(slot.startTime) }}
              {{ slot.isBooked ? '- ' + slot.studentName : '' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hafta Görünümü -->
    <div v-else-if="currentView === 'Hafta'" class="border rounded-lg">
      <div class="grid grid-cols-8 border-b">
        <!-- Saat başlığı -->
        <div class="p-2 text-center text-sm font-medium text-gray-500 border-r">
          Saat
        </div>
        <!-- Günler -->
        <div
          v-for="date in weekDays"
          :key="date"
          class="p-2 text-center text-sm font-medium text-gray-500"
        >
          {{ date }}
        </div>
      </div>

      <!-- Saatlik grid -->
      <div class="divide-y">
        <div
          v-for="hour in 24"
          :key="hour"
          class="grid grid-cols-8"
        >
          <!-- Saat -->
          <div class="p-2 text-sm text-gray-500 border-r">
            {{ formatHour((hour - 1).toString().padStart(2, '0') + ':00') }}
          </div>
          <!-- Her gün için slot -->
          <div
            v-for="(date, index) in currentWeekDays"
            :key="index"
            class="p-2 border-r relative"
          >
            <div
              v-for="slot in getSlotsForDateAndHour(date, hour - 1)"
              :key="slot.id"
              class="text-xs p-1 rounded absolute inset-x-1"
              :class="[
                slot.isBooked 
                  ? 'bg-[#ff8913] text-white' 
                  : 'bg-[#3871b1] text-white'
              ]"
              :title="getSlotTitle(slot)"
            >
              {{ slot.isBooked ? slot.studentName : 'Müsait' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-vue-next'
import { useSupabase } from '@/composables/useSupabase'
import type { Slot } from '@/types/Slot'
import { formatMonth, formatHour } from '@/utils/dateTime'

const { supabase } = useSupabase()

// State
const currentDate = ref(new Date())
const currentView = ref<'Ay' | 'Hafta'>('Ay')
const slots = ref<Slot[]>([])
const isLoading = ref(false)

const viewOptions = ['Ay', 'Hafta']
const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

// Calendar helpers
const getMonthDays = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days = []
  const firstDayOfWeek = firstDay.getDay() || 7
  
  // Önceki aydan günler
  for (let i = firstDayOfWeek - 1; i > 0; i--) {
    days.push(new Date(year, month, 1 - i))
  }
  
  // Bu ayın günleri
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }
  
  // Sonraki aydan günler
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i))
  }
  
  return days
}

const calendarDays = computed(() => getMonthDays(currentDate.value))

const currentWeekDays = computed(() => {
  const date = new Date(currentDate.value)
  const day = date.getDay() || 7
  date.setDate(date.getDate() - day + 1)
  
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(date)
    d.setDate(date.getDate() + i)
    return d
  })
})

// Navigation methods
const previousMonth = () => {
  const date = new Date(currentDate.value)
  date.setMonth(date.getMonth() - 1)
  currentDate.value = date
  fetchSlots()
}

const nextMonth = () => {
  const date = new Date(currentDate.value)
  date.setMonth(date.getMonth() + 1)
  currentDate.value = date
  fetchSlots()
}

const today = () => {
  currentDate.value = new Date()
  fetchSlots()
}

// Date helpers
const isSameMonth = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() && 
         date1.getMonth() === date2.getMonth()
}

const isToday = (date: Date) => {
  const today = new Date()
  return date.getDate() === today.getDate() && 
         date.getMonth() === today.getMonth() && 
         date.getFullYear() === today.getFullYear()
}

// Slot helpers
const getSlotsForDate = (date: Date) => {
  return slots.value.filter(slot => {
    const slotDate = new Date(slot.date)
    return slotDate.getDate() === date.getDate() && 
           slotDate.getMonth() === date.getMonth() && 
           slotDate.getFullYear() === date.getFullYear()
  })
}

const getSlotsForDateAndHour = (date: Date, hour: number) => {
  return getSlotsForDate(date).filter(slot => {
    const [slotHour] = slot.startTime.split(':')
    return parseInt(slotHour) === hour
  })
}

const getSlotTitle = (slot: Slot) => {
  return slot.isBooked 
    ? `${slot.studentName} - ${formatHour(slot.startTime)}`
    : `Müsait - ${formatHour(slot.startTime)}`
}

// Data fetching
const fetchSlots = async () => {
  isLoading.value = true
  
  const startDate = new Date(currentDate.value)
  startDate.setDate(1)
  
  const endDate = new Date(currentDate.value)
  endDate.setMonth(endDate.getMonth() + 1, 0)
  
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date')
    .order('start_time')

  if (data && !error) {
    slots.value = data
  }
  
  isLoading.value = false
}

// Initial load
fetchSlots()
</script>