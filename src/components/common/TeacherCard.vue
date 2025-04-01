<template>
    <div 
      class="border rounded-lg overflow-hidden hover:border-[#3871b1] transition-colors"
      :class="{ 'border-[#3871b1] shadow-lg': isSelected }"
    >
      <!-- Öğretmen Bilgileri -->
      <div class="p-4">
        <div class="flex items-start gap-4">
          <!-- Avatar -->
          <img 
            :src="teacher.avatar || '/default-avatar.png'" 
            alt="Profil"
            class="w-16 h-16 rounded-full object-cover"
          />
          
          <!-- Öğretmen Bilgileri -->
          <div class="flex-1">
            <h3 class="font-medium text-[#3871b1]">{{ teacher.name }}</h3>
            
            <!-- Öğretmen Detayları (varsa) -->
            <div v-if="showDetails" class="mt-1 text-sm text-gray-500">
              {{ teacher.bio?.substring(0, 60) }}{{ teacher.bio?.length > 60 ? '...' : '' }}
            </div>
            
            <!-- Müsait Saatler (varsa) -->
            <div v-if="showAvailableSlots" class="mt-2 flex flex-wrap items-center gap-2">
              <span 
                v-for="(slot, index) in teacher.nextAvailableSlots?.slice(0, 3)"
                :key="index"
                class="px-2 py-1 text-xs bg-blue-50 text-[#3871b1] rounded-full"
              >
                {{ formatDateTime ? formatDateTime(slot) : slot }}
              </span>
              
              <span 
                v-if="teacher.nextAvailableSlots?.length > 3" 
                class="text-xs text-gray-500"
              >
                +{{ teacher.nextAvailableSlots.length - 3 }} müsait saat
              </span>
            </div>
            
            <!-- Dersler veya Puan (varsa) -->
            <div v-if="showStats" class="mt-2 text-sm text-gray-600 flex items-center gap-4">
              <div v-if="teacher.lessonCount" class="flex items-center">
                <calendar-icon class="h-4 w-4 mr-1 text-gray-400" />
                {{ teacher.lessonCount }} ders
              </div>
              
              <div v-if="teacher.rating" class="flex items-center">
                <star-icon class="h-4 w-4 mr-1 text-[#ff8913]" />
                {{ teacher.rating }} / 5
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Aksiyon Butonu -->
      <div v-if="showActions" class="p-4 bg-gray-50 flex justify-end">
        <slot name="actions">
          <button
            @click="$emit('select', teacher)"
            class="px-4 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
          >
            {{ actionText }}
          </button>
        </slot>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { Star as StarIcon, Calendar as CalendarIcon } from 'lucide-vue-next'
  import type { Teacher } from '@/types/User'
  
  // Props
  const props = defineProps({
    teacher: {
      type: Object as () => Teacher,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    showDetails: {
      type: Boolean,
      default: true
    },
    showAvailableSlots: {
      type: Boolean,
      default: true
    },
    showStats: {
      type: Boolean,
      default: true
    },
    showActions: {
      type: Boolean,
      default: true
    },
    actionText: {
      type: String,
      default: 'Müsait Saatleri Gör'
    },
    formatDateTime: {
      type: Function,
      default: null
    }
  })
  
  // Emits
  defineEmits(['select'])
  </script>