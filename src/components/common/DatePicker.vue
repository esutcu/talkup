<template>
    <div class="date-picker w-full">
      <!-- Ay/Yıl Navigasyonu -->
      <div class="flex justify-between items-center mb-4">
        <button 
          @click="previousMonth"
          class="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
        >
          <chevron-left-icon class="h-5 w-5" />
        </button>
        <div class="font-medium">{{ formatMonthYear(currentDate) }}</div>
        <button 
          @click="nextMonth"
          class="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
        >
          <chevron-right-icon class="h-5 w-5" />
        </button>
      </div>
      
      <!-- Haftanın Günleri -->
      <div class="grid grid-cols-7 mb-2">
        <div 
          v-for="dayName in dayNames" 
          :key="dayName" 
          class="text-center text-sm font-medium text-gray-500"
        >
          {{ dayName }}
        </div>
      </div>
      
      <!-- Takvim Günleri -->
      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="date in calendarDays"
          :key="date.toISOString()"
          class="p-2 rounded-lg text-sm"
          :class="[
            isSameDay(date, modelValue) 
              ? 'bg-[#3871b1] text-white' 
              : isToday(date)
                ? 'border border-[#3871b1] text-[#3871b1]'
                : !isSameMonth(date, currentDate)
                  ? 'text-gray-400 hover:bg-gray-100'
                  : 'hover:bg-gray-100'
          ]"
          :disabled="isDateDisabled(date)"
          @click="selectDate(date)"
        >
          {{ date.getDate() }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-vue-next'
  
  // Props
  const props = defineProps({
    modelValue: {
      type: Date,
      required: true
    },
    minDate: {
      type: Date,
      default: null
    },
    maxDate: {
      type: Date,
      default: null
    },
    disabledDates: {
      type: Array as () => Date[],
      default: () => []
    },
    disabledDays: {
      type: Array as () => number[],
      default: () => [] // 0: Pazar, 1: Pazartesi, ... 6: Cumartesi
    }
  })
  
  // Emits
  const emit = defineEmits(['update:modelValue'])
  
  // State
  const currentDate = ref(new Date(props.modelValue))
  
  // Haftanın günleri
  const dayNames = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']
  
  // Takvim hesaplamaları
  const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Haftanın ilk günü Pazartesi (1) olarak ayarla
    const firstDayOfWeek = firstDay.getDay() || 7 // 0 (Pazar) yerine 7 kullan
    
    const days = []
    
    // Önceki aydan günler
    for (let i = firstDayOfWeek - 1; i > 0; i--) {
      const date = new Date(year, month, 1 - i)
      days.push(date)
    }
    
    // Mevcut ayın günleri
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      days.push(date)
    }
    
    // Sonraki aydan günler (6 satır x 7 sütun = 42 gün olacak şekilde)
    const daysNeeded = 42 - days.length
    for (let i = 1; i <= daysNeeded; i++) {
      const date = new Date(year, month + 1, i)
      days.push(date)
    }
    
    return days
  })
  
  // Tarih biçimlendirme
  const formatMonthYear = (date: Date) => {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ]
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }
  
  // Tarih karşılaştırma yardımcıları
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }
  
  const isSameMonth = (date1: Date, date2: Date) => {
    return date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }
  
  const isToday = (date: Date) => {
    const today = new Date()
    return isSameDay(date, today)
  }
  
  // Tarih devre dışı mı kontrolü
  const isDateDisabled = (date: Date) => {
    // minDate kontrolü
    if (props.minDate && date < props.minDate) {
      return true
    }
    
    // maxDate kontrolü
    if (props.maxDate && date > props.maxDate) {
      return true
    }
    
    // Belirli haftanın günleri devre dışı mı
    if (props.disabledDays.includes(date.getDay())) {
      return true
    }
    
    // Belirli tarihler devre dışı mı
    return props.disabledDates.some(disabledDate => isSameDay(date, disabledDate))
  }
  
  // Navigasyon metodları
  const previousMonth = () => {
    const newDate = new Date(currentDate.value)
    newDate.setMonth(newDate.getMonth() - 1)
    currentDate.value = newDate
  }
  
  const nextMonth = () => {
    const newDate = new Date(currentDate.value)
    newDate.setMonth(newDate.getMonth() + 1)
    currentDate.value = newDate
  }
  
  // Tarih seçme
  const selectDate = (date: Date) => {
    emit('update:modelValue', date)
  }
  
  // modelValue değiştiğinde mevcut ayı güncelle
  watch(() => props.modelValue, (newValue) => {
    if (!isSameMonth(newValue, currentDate.value)) {
      currentDate.value = new Date(newValue)
    }
  })
  </script>