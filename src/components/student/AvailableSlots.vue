<template>
    <div class="space-y-6">
      <!-- Tarih Seçici -->
      <div>
        <label class="text-sm font-medium mb-2 block">Tarih Seçin</label>
        <date-picker
          v-model="selectedDate"
          :min-date="new Date()"
          @update:model-value="fetchAvailableSlots"
        />
      </div>
  
      <!-- Müsait Saatler -->
      <div>
        <label class="text-sm font-medium mb-2 block">Müsait Saatler</label>
        
        <!-- Yükleniyor -->
        <div v-if="isLoading" class="text-center py-8">
          <span class="text-gray-500">Müsait saatler yükleniyor...</span>
        </div>
  
        <!-- Müsait saat yok -->
        <div v-else-if="availableSlots.length === 0" class="text-center py-8">
          <div class="text-gray-500">Seçilen tarih için müsait saat bulunamadı.</div>
          <button 
            @click="selectedDate = new Date()"
            class="mt-4 text-sm text-[#3871b1] hover:underline"
          >
            Bugünü Seç
          </button>
        </div>
  
        <!-- Saat seçici -->
        <time-slot-picker
          v-else
          v-model="selectedTime"
          :selected-date="selectedDate"
          :disabled-times="disabledTimes"
          :booked-times="bookedTimes"
          @update:model-value="handleTimeSelection"
        />
      </div>
      
      <!-- Seçilen Saat Bilgisi -->
      <div v-if="selectedTime" class="bg-blue-50 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-[#3871b1]">Seçilen Tarih ve Saat</div>
            <div class="font-medium">{{ formatDate(selectedDate) }} - {{ selectedTime }}</div>
          </div>
          <button 
            @click="confirmSelection"
            class="px-4 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
          >
            Öğretmen Seç
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import DatePicker from '@/components/common/DatePicker.vue'
  import TimeSlotPicker from '@/components/common/TimeSlotPicker.vue'
  import { useSupabase } from '@/composables/useSupabase'
  import { formatDate } from '@/utils/dateTime'
  import type { Slot } from '@/types/Slot'
  
  // Props
  const props = defineProps({
    teacherId: {
      type: String,
      default: null
    }
  })
  
  // Emits
  const emit = defineEmits(['select'])
  
  // Composables
  const { supabase } = useSupabase()
  
  // State
  const selectedDate = ref(new Date())
  const selectedTime = ref<string | null>(null)
  const availableSlots = ref<Slot[]>([])
  const isLoading = ref(false)
  
  // Computed
  const disabledTimes = computed(() => {
    // Zaten geçmiş olan saatler
    const now = new Date()
    const today = new Date()
    const isToday = selectedDate.value.getDate() === today.getDate() &&
                   selectedDate.value.getMonth() === today.getMonth() &&
                   selectedDate.value.getFullYear() === today.getFullYear()
    
    if (!isToday) return []
    
    // Şu anki saatten önceki tüm saatleri devre dışı bırak
    const currentHour = now.getHours()
    const times = []
    
    for (let i = 0; i < currentHour; i++) {
      times.push(`${i.toString().padStart(2, '0')}:00`)
    }
    
    return times
  })
  
  const bookedTimes = computed(() => {
    return availableSlots.value
      .filter(slot => !slot.isAvailable)
      .map(slot => slot.startTime)
  })
  
  // Methods
  const fetchAvailableSlots = async () => {
    isLoading.value = true
    
    try {
      const formattedDate = selectedDate.value.toISOString().split('T')[0]
      
      const query = supabase
        .from('slots')
        .select('*')
        .eq('date', formattedDate)
      
      // Belirli bir öğretmen için filtreleme
      if (props.teacherId) {
        query.eq('teacher_id', props.teacherId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      // Zaman formatlama düzeltmeleri
      availableSlots.value = data.map(slot => ({
        ...slot,
        startTime: slot.start_time,
        isAvailable: slot.is_available
      }))
      
      // Slot seçimini sıfırla
      selectedTime.value = null
      
    } catch (error) {
      console.error('Fetch slots error:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  // Saat seçildiğinde işle
  const handleTimeSelection = (time: string) => {
    selectedTime.value = time
  }
  
  // Seçimi onayla
  const confirmSelection = () => {
    if (selectedDate.value && selectedTime.value) {
      emit('select', {
        date: selectedDate.value,
        time: selectedTime.value
      })
    }
  }
  
  // Tarih değişimi izle
  watch(() => props.teacherId, () => {
    fetchAvailableSlots()
  })
  
  // İlk yükleme
  fetchAvailableSlots()
  </script>