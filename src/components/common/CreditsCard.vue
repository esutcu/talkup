<template>
    <div class="rounded-lg border overflow-hidden">
      <!-- Kart Başlığı -->
      <div class="p-4 border-b">
        <h2 class="font-medium">{{ title }}</h2>
      </div>
      
      <!-- Kredi Bilgileri -->
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">{{ subtitle }}</div>
            <div class="mt-2 flex items-baseline">
              <div class="text-3xl font-bold text-[#3871b1]">{{ credits }}</div>
              <div class="ml-2 text-sm text-gray-500">kredi</div>
            </div>
          </div>
          <div class="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
            <credit-card-icon class="h-6 w-6 text-[#3871b1]" />
          </div>
        </div>
        
        <!-- Son Kullanılan Kredi (Opsiyonel) -->
        <div v-if="showLastUsage && lastUsageDate" class="mt-4 text-sm text-gray-500">
          <div class="flex items-center">
            <clock-icon class="h-4 w-4 mr-1" />
            <span>Son Kullanım: {{ formatDateTime(lastUsageDate) }}</span>
          </div>
        </div>
        
        <!-- İlerleme Çubuğu (Opsiyonel) -->
        <div v-if="showProgress && typeof maxCredits === 'number'" class="mt-4">
          <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{{ credits }} / {{ maxCredits }} Kredi</span>
            <span>{{ progressPercentage }}%</span>
          </div>
          <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-[#3871b1]" 
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- Kart Alt Kısmı (Opsiyonel) -->
      <div v-if="$slots.footer" class="px-6 py-3 bg-gray-50 border-t">
        <slot name="footer">
          <div class="text-sm text-gray-500">
            Her ders 1 kredi değerindedir.
          </div>
        </slot>
      </div>
      
      <!-- Aksiyon Butonu (Opsiyonel) -->
      <div v-if="showAction" class="p-4 border-t">
        <slot name="action">
          <button
            @click="$emit('action')"
            class="w-full px-4 py-2 bg-[#ff8913] text-white rounded-lg hover:bg-[#ff8913]/90"
          >
            {{ actionText }}
          </button>
        </slot>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { CreditCard as CreditCardIcon, Clock as ClockIcon } from 'lucide-vue-next'
  import { formatDateTime } from '@/utils/dateTime'
  
  // Props
  const props = defineProps({
    credits: {
      type: Number,
      required: true
    },
    maxCredits: {
      type: Number,
      default: null
    },
    title: {
      type: String,
      default: 'Kredi Bakiyesi'
    },
    subtitle: {
      type: String,
      default: 'Mevcut Krediniz'
    },
    lastUsageDate: {
      type: [String, Date],
      default: null
    },
    showLastUsage: {
      type: Boolean,
      default: false
    },
    showProgress: {
      type: Boolean,
      default: false
    },
    showAction: {
      type: Boolean,
      default: false
    },
    actionText: {
      type: String,
      default: 'Kredi Satın Al'
    }
  })
  
  // Emits
  defineEmits(['action'])
  
  // Computed
  const progressPercentage = computed(() => {
    if (!props.maxCredits) return 0
    return Math.min(Math.round((props.credits / props.maxCredits) * 100), 100)
  })
  </script>