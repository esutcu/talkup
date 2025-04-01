# src/pages/teacher/Calendar/Slots.vue
<template>
  <div class="space-y-8">
    <!-- Üst Tab Navigasyonu -->
    <div class="border-b">
      <div class="flex">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="currentTab = tab.id"
          class="px-6 py-3 text-sm font-medium border-b-2 -mb-[2px]"
          :class="[
            currentTab === tab.id
              ? 'border-[#3871b1] text-[#3871b1]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>

    <!-- Tab İçerikleri -->
    <div>
      <!-- Müsait Saat Yönetimi -->
      <div v-show="currentTab === 'slots'">
        <slot-manager 
          @slot-added="handleSlotAdded"
          @slot-deleted="handleSlotDeleted"
        />
      </div>

      <!-- Takvim Görünümü -->
      <div v-show="currentTab === 'calendar'">
        <calendar-view 
          ref="calendarRef"
          @date-selected="handleDateSelected"
        />
      </div>
    </div>

    <!-- Alt Bilgi Kartı -->
    <div 
      v-if="showInfoCard" 
      class="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 max-w-sm"
    >
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-medium text-[#3871b1]">{{ infoMessage }}</h3>
          <p class="text-sm text-gray-500 mt-1">
            {{ infoDescription }}
          </p>
        </div>
        <button 
          @click="closeInfoCard"
          class="text-gray-400 hover:text-gray-600"
        >
          <x-icon class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X as XIcon } from 'lucide-vue-next'
import SlotManager from '@/components/teacher/SlotManager.vue'
import CalendarView from '@/components/teacher/CalendarView.vue'

// Tab yönetimi
const tabs = [
  { id: 'slots', name: 'Müsait Saat Yönetimi' },
  { id: 'calendar', name: 'Takvim Görünümü' }
]
const currentTab = ref('slots')

// Bilgi kartı yönetimi
const showInfoCard = ref(false)
const infoMessage = ref('')
const infoDescription = ref('')

// Takvim referansı
const calendarRef = ref()

// Event handlers
const handleSlotAdded = () => {
  // Takvimi güncelle
  calendarRef.value?.fetchSlots()
  
  // Bilgi kartını göster
  infoMessage.value = 'Müsait Saat Eklendi'
  infoDescription.value = 'Yeni müsait saatiniz başarıyla kaydedildi.'
  showInfoCard.value = true
  
  // 3 saniye sonra kapat
  setTimeout(() => {
    showInfoCard.value = false
  }, 3000)
}

const handleSlotDeleted = () => {
  // Takvimi güncelle
  calendarRef.value?.fetchSlots()
  
  // Bilgi kartını göster
  infoMessage.value = 'Müsait Saat Silindi'
  infoDescription.value = 'Seçili müsait saat başarıyla silindi.'
  showInfoCard.value = true
  
  // 3 saniye sonra kapat
  setTimeout(() => {
    showInfoCard.value = false
  }, 3000)
}

const handleDateSelected = (date: Date) => {
  // Slot yönetimi tabına geç ve tarihi seç
  currentTab.value = 'slots'
  // Slot manager komponentine seçili tarihi ilet
}

const closeInfoCard = () => {
  showInfoCard.value = false
}
</script>