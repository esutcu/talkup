<template>
    <div class="time-slot-picker">
      <!-- Başlık (opsiyonel) -->
      <div v-if="title" class="mb-3">
        <label class="text-sm font-medium text-gray-700">{{ title }}</label>
      </div>
      
      <!-- Zaman aralığı seçicisi -->
      <div class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        <button
          v-for="time in availableTimes"
          :key="time"
          @click="selectTime(time)"
          class="px-3 py-2 text-sm text-center border rounded-lg"
          :class="[
            modelValue === time 
              ? 'border-[#3871b1] bg-blue-50 text-[#3871b1]' 
              : 'hover:border-gray-300',
            getTimeStatus(time) === 'disabled' ? 'opacity-50 cursor-not-allowed' : ''
          ]"
          :disabled="getTimeStatus(time) === 'disabled'"
        >
          {{ formatTime(time) }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  
  // Props
  const props = defineProps({
    modelValue: {
      type: String,
      default: null
    },
    startHour: {
      type: Number,
      default: 9 // 09:00
    },
    endHour: {
      type: Number,
      default: 18 // 18:00
    },
    interval: {
      type: Number,
      default: 60 // 60 dakika (1 saat)
    },
    disabledTimes: {
      type: Array as () => string[],
      default: () => []
    },
    bookedTimes: {
      type: Array as () => string[],
      default: () => []
    },
    selectedDate: {
      type: Date,
      default: () => new Date()
    },
    title: {
      type: String,
      default: ''
    }
  })
  
  // Emits
  const emit = defineEmits(['update:modelValue'])
  
  // Kullanılabilir zaman aralıklarını oluştur
  const availableTimes = computed(() => {
    const times = []
    const totalMinutesInDay = 24 * 60
    
    for (
      let minutes = props.startHour * 60;
      minutes < Math.min(props.endHour * 60, totalMinutesInDay);
      minutes += props.interval
    ) {
      const hour = Math.floor(minutes / 60)
      const minute = minutes % 60
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      times.push(time)
    }
    
    return times
  })
  
  // Zamanın durumunu belirle (normal, disabled, booked)
  const getTimeStatus = (time: string) => {
    // Geçmiş zamanlar için
    if (isTimeInPast(time)) {
      return 'disabled'
    }
    
    // Devre dışı bırakılmış zamanlar
    if (props.disabledTimes.includes(time)) {
      return 'disabled'
    }
    
    // Rezerve edilmiş zamanlar
    if (props.bookedTimes.includes(time)) {
      return 'booked'
    }
    
    return 'available'
  }
  
  // Zaman geçmiş mi kontrolü
  const isTimeInPast = (time: string) => {
    const now = new Date()
    const today = new Date()
    const [hours, minutes] = time.split(':').map(Number)
    
    const selectedDateTime = new Date(props.selectedDate)
    selectedDateTime.setHours(hours, minutes, 0, 0)
    
    // Aynı gün ama geçmiş saat mi kontrol et
    const isSameDay = 
      selectedDateTime.getDate() === today.getDate() && 
      selectedDateTime.getMonth() === today.getMonth() && 
      selectedDateTime.getFullYear() === today.getFullYear()
    
    if (isSameDay) {
      return selectedDateTime <= now
    }
    
    // Geçmiş gün mü kontrol et
    return selectedDateTime < now
  }
  
  // Saat formatı
  const formatTime = (time: string) => {
    return time // Özel bir format gerekirse buraya ekleme yapılabilir
  }
  
  // Saat seçimi
  const selectTime = (time: string) => {
    if (getTimeStatus(time) !== 'disabled') {
      emit('update:modelValue', time)
    }
  }
  </script>