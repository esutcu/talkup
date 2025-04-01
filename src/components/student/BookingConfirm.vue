<template>
    <div class="space-y-6">
      <h2 class="text-lg font-medium text-[#3871b1]">Rezervasyon Onayı</h2>
      
      <!-- Rezervasyon Bilgileri Kartı -->
      <div class="border rounded-lg overflow-hidden">
        <!-- Öğretmen Bilgisi -->
        <div class="p-4 flex items-center gap-4">
          <img 
            :src="teacher?.avatar || '/default-avatar.png'" 
            alt="Öğretmen" 
            class="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 class="font-medium text-[#3871b1]">{{ teacher?.name }}</h3>
          </div>
        </div>
        
        <!-- Ders Detayları -->
        <div class="grid grid-cols-2 gap-4 p-4 border-t border-b">
          <div>
            <div class="text-sm text-gray-500">Tarih</div>
            <div class="font-medium">{{ formatDate(date) }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Saat</div>
            <div class="font-medium">{{ time }}</div>
          </div>
        </div>
        
        <!-- Kredi Bilgisi -->
        <div class="p-4 bg-blue-50">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-500">Kullanılacak Kredi</div>
              <div class="text-xl font-bold">1 Kredi</div>
            </div>
            <credit-card-icon class="h-6 w-6 text-[#3871b1]" />
          </div>
        </div>
      </div>
      
      <!-- Kredi Uyarısı -->
      <div v-if="!hasEnoughCredit" class="bg-red-50 border border-red-100 p-4 rounded-lg">
        <div class="flex gap-3">
          <alert-circle-icon class="h-5 w-5 text-red-500" />
          <div>
            <h3 class="font-medium text-red-800">Yetersiz Kredi</h3>
            <p class="text-sm text-red-600 mt-1">
              Rezervasyon için yeterli krediniz bulunmuyor. Lütfen kredi satın alın.
            </p>
            <button 
              @click="goToPurchase"
              class="mt-3 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
            >
              Kredi Satın Al
            </button>
          </div>
        </div>
      </div>
      
      <!-- Onay ve İptal Butonları -->
      <div class="flex justify-between">
        <button 
          @click="goBack"
          class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Geri
        </button>
        
        <button 
          @click="confirmBooking"
          class="px-6 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
          :disabled="!hasEnoughCredit || isSubmitting"
        >
          {{ isSubmitting ? 'İşleniyor...' : 'Rezervasyonu Onayla' }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { CreditCard as CreditCardIcon, AlertCircle as AlertCircleIcon } from 'lucide-vue-next'
  import { useBookingStore } from '@/stores/booking'
  import { useCredits } from '@/composables/useCredits'
  import { formatDate } from '@/utils/dateTime'
  import type { Teacher } from '@/types/User'
  
  // Props
  const props = defineProps({
    teacher: {
      type: Object as () => Teacher,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    }
  })
  
  // Emits
  const emit = defineEmits(['next', 'back'])
  
  // Composables and stores
  const router = useRouter()
  const bookingStore = useBookingStore()
  const { balance: creditBalance, fetchBalance } = useCredits()
  
  // State
  const isSubmitting = ref(false)
  
  // Computed
  const hasEnoughCredit = computed(() => creditBalance.value >= 1)
  
  // Methods
  const confirmBooking = async () => {
    if (!hasEnoughCredit.value) return
    
    isSubmitting.value = true
    
    try {
      const booking = await bookingStore.createBooking({
        teacherId: props.teacher.id,
        date: props.date,
        startTime: props.time
      })
      
      if (booking) {
        emit('next', booking)
      } else {
        throw new Error('Rezervasyon oluşturulamadı')
      }
    } catch (error) {
      console.error('Booking error:', error)
    } finally {
      isSubmitting.value = false
    }
  }
  
  const goBack = () => {
    emit('back')
  }
  
  const goToPurchase = () => {
    router.push('/student/credits/buy')
  }
  
  // Kredi bakiyesini kontrol et
  onMounted(async () => {
    if (bookingStore.userId) {
      await fetchBalance(bookingStore.userId)
    }
  })
  </script>