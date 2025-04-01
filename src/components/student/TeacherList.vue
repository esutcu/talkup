<template>
    <div class="space-y-6">
      <!-- Filtreleme Araçları -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Arama -->
        <div class="relative">
          <search-icon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Öğretmen ara..."
            class="pl-10 pr-4 py-2 w-full border rounded-lg"
            @input="filterTeachers"
          />
        </div>
  
        <!-- Müsaitlik Filtresi -->
        <div>
          <select 
            v-model="availabilityFilter"
            class="w-full px-4 py-2 border rounded-lg"
            @change="filterTeachers"
          >
            <option value="">Müsaitlik</option>
            <option value="today">Bugün Müsait</option>
            <option value="week">Bu Hafta Müsait</option>
            <option value="any">Tümü</option>
          </select>
        </div>
      </div>
  
      <!-- Yükleniyor -->
      <div v-if="isLoading" class="text-center py-8">
        <span class="text-gray-500">Öğretmenler yükleniyor...</span>
      </div>
  
      <!-- Sonuç Bulunamadı -->
      <div v-else-if="filteredTeachers.length === 0" class="text-center py-8">
        <div class="text-gray-500">Arama kriterlerinize uygun öğretmen bulunamadı.</div>
        <button 
          @click="resetFilters"
          class="mt-4 text-sm text-[#3871b1] hover:underline"
        >
          Filtreleri Temizle
        </button>
      </div>
  
      <!-- Öğretmen Listesi -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <teacher-card
          v-for="teacher in filteredTeachers"
          :key="teacher.id"
          :teacher="teacher"
          :format-date-time="formatDateTime"
          @select="selectTeacher"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { Search as SearchIcon } from 'lucide-vue-next'
  import { useTeacherFilterStore } from '@/stores/teacherFilter'
  import TeacherCard from '@/components/common/TeacherCard.vue'
  import { formatDateTime } from '@/utils/dateTime'
  import type { Teacher } from '@/types/User'
  
  // Props
  const props = defineProps({
    selectedDate: {
      type: Date,
      default: null
    },
    selectedTime: {
      type: String,
      default: null
    }
  })
  
  // Emits
  const emit = defineEmits(['select'])
  
  // Store
  const teacherStore = useTeacherFilterStore()
  
  // Reactive refs
  const searchQuery = ref('')
  const availabilityFilter = ref<'today' | 'week' | 'any' | ''>('')
  const isLoading = computed(() => teacherStore.isLoading)
  
  // Computed
  const filteredTeachers = computed(() => {
    return teacherStore.filteredTeachers
  })
  
  // Methods
  const filterTeachers = () => {
    teacherStore.setSearchQuery(searchQuery.value)
    teacherStore.setAvailabilityFilter(availabilityFilter.value)
    
    if (props.selectedDate && props.selectedTime) {
      teacherStore.setSelectedDateTime(props.selectedDate, props.selectedTime)
    }
  }
  
  const resetFilters = () => {
    searchQuery.value = ''
    availabilityFilter.value = ''
    teacherStore.clearFilters()
  }
  
  const selectTeacher = (teacher: Teacher) => {
    emit('select', teacher)
  }
  
  // Lifecycle hooks
  onMounted(() => {
    // Öğretmenleri yükle
    teacherStore.fetchTeachers()
    
    // Tarih ve saat seçili ise filtrele
    if (props.selectedDate && props.selectedTime) {
      teacherStore.setSelectedDateTime(props.selectedDate, props.selectedTime)
    }
  })
  </script>