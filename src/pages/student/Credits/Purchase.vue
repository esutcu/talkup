# src/pages/student/Credits/Purchase.vue
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold text-[#3871b1]">Kredi Paketi Satın Al</h1>
      <button
        @click="router.push('/student/credits/history')"
        class="text-sm text-[#ff8913] hover:text-[#ff8913]/90"
      >
        Kredi Geçmişi
      </button>
    </div>

    <!-- Mevcut Kredi -->
    <div class="p-4 bg-blue-50 rounded-lg">
      <div class="flex items-center gap-3">
        <credit-card-icon class="h-5 w-5 text-[#3871b1]" />
        <span class="text-[#3871b1]">
          Mevcut Krediniz: <strong>{{ currentCredits }}</strong>
        </span>
      </div>
    </div>

    <!-- Paket Listesi -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="pack in packages"
        :key="pack.id"
        class="border rounded-lg overflow-hidden hover:border-[#3871b1] transition-all"
        :class="{'border-[#3871b1] shadow-lg': selectedPackage?.id === pack.id}"
      >
        <!-- Paket Başlığı -->
        <div class="p-6">
          <h3 class="text-lg font-medium text-[#3871b1]">{{ pack.name }}</h3>
          <div class="mt-2 text-3xl font-bold">
            {{ formatPrice(pack.price) }}
          </div>
          <div class="mt-1 text-sm text-gray-500">
            {{ pack.credit_amount }} kredi
          </div>
          
          <!-- Paket Özellikleri -->
          <ul class="mt-4 space-y-2">
            <li class="flex items-center gap-2 text-sm text-gray-600">
              <check-icon class="h-4 w-4 text-green-500" />
              {{ pack.credit_amount }} ders hakkı
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-600">
              <check-icon class="h-4 w-4 text-green-500" />
              {{ Math.round(pack.price / pack.credit_amount) }}₺/ders
            </li>
            <li class="flex items-center gap-2 text-sm text-gray-600">
              <check-icon class="h-4 w-4 text-green-500" />
              30 gün geçerlilik
            </li>
          </ul>
        </div>

        <!-- Satın Al Butonu -->
        <div class="p-4 bg-gray-50">
          <button
            @click="selectPackage(pack)"
            class="w-full px-4 py-2 rounded-lg"
            :class="[
              selectedPackage?.id === pack.id
                ? 'bg-[#3871b1] text-white'
                : 'border-2 border-[#3871b1] text-[#3871b1] hover:bg-[#3871b1] hover:text-white'
            ]"
          >
            {{ selectedPackage?.id === pack.id ? 'Seçildi' : 'Seç' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Ödeme Alanı -->
    <div v-if="selectedPackage" class="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-500">Seçilen Paket</div>
          <div class="font-medium">{{ selectedPackage.name }}</div>
          <div class="text-sm text-gray-500">
            {{ selectedPackage.credit_amount }} kredi
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="text-sm text-gray-500">Ödenecek Tutar</div>
            <div class="text-xl font-bold text-[#3871b1]">
              {{ formatPrice(selectedPackage.price) }}
            </div>
          </div>
          <button
            @click="startPayment"
            class="px-6 py-3 bg-[#ff8913] text-white rounded-lg hover:bg-[#ff8913]/90"
            :disabled="isProcessing"
          >
            {{ isProcessing ? 'İşleniyor...' : 'Ödemeye Geç' }}
          </button>
        </div>
      </div>
    </div>

    <!-- İşlem Sonuç Modalı -->
    <modal-dialog v-model="showResultModal">
      <div class="p-6 text-center">
        <div v-if="purchaseSuccess" class="space-y-4">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <check-icon class="w-8 h-8 text-green-600" />
          </div>
          <h3 class="text-lg font-medium text-[#3871b1]">Satın Alma Başarılı!</h3>
          <p class="text-gray-500">
            {{ selectedPackage?.credit_amount }} kredi hesabınıza tanımlandı.
          </p>
          <div class="mt-6">
            <button
              @click="router.push('/student/credits/history')"
              class="px-6 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
            >
              Kredi Geçmişi
            </button>
          </div>
        </div>
        <div v-else class="space-y-4">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <x-icon class="w-8 h-8 text-red-600" />
          </div>
          <h3 class="text-lg font-medium text-red-600">İşlem Başarısız</h3>
          <p class="text-gray-500">
            Bir hata oluştu. Lütfen tekrar deneyin.
          </p>
          <div class="mt-6">
            <button
              @click="showResultModal = false"
              class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </modal-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  CreditCard as CreditCardIcon,
  Check as CheckIcon,
  X as XIcon
} from 'lucide-vue-next'
import { useSupabase } from '@/composables/useSupabase'
import { useCredits } from '@/composables/useCredits'
import { useAuthStore } from '@/stores/auth'
import ModalDialog from '@/components/common/ModalDialog.vue'
import { formatPrice } from '@/utils/dateTime'
import { useIyzico } from '@/composables/useIyzico'
import type { CreditPackage } from '@/types/Credit'

const router = useRouter()
const authStore = useAuthStore()
const { supabase } = useSupabase()
const { balance: currentCredits, purchaseCredits } = useCredits()
const { initializePayment } = useIyzico()

// State
const packages = ref<CreditPackage[]>([])
const selectedPackage = ref<CreditPackage | null>(null)
const isProcessing = ref(false)
const showResultModal = ref(false)
const purchaseSuccess = ref(false)

// Methods
const fetchPackages = async () => {
  const { data } = await supabase
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .order('credit_amount')

  if (data) {
    packages.value = data
  }
}

const selectPackage = (pack: CreditPackage) => {
  selectedPackage.value = pack
}

const startPayment = async () => {
  if (!selectedPackage.value || !authStore.userId || isProcessing.value) return

  isProcessing.value = true

  try {
    // Iyzico ödeme başlat
    const paymentResult = await initializePayment({
      price: selectedPackage.value.price,
      paidPrice: selectedPackage.value.price,
      userId: authStore.userId,
      packageId: selectedPackage.value.id
    })

    if (paymentResult.success) {
      // Kredi satın alma işlemini tamamla
      const success = await purchaseCredits(
        authStore.userId,
        selectedPackage.value.id
      )

      purchaseSuccess.value = success
    } else {
      purchaseSuccess.value = false
    }
  } catch (error) {
    console.error('Payment failed:', error)
    purchaseSuccess.value = false
  }

  showResultModal.value = true
  isProcessing.value = false
}

// Initial load
onMounted(() => {
  fetchPackages()
})
</script>