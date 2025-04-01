# src/pages/student/Credits/History.vue
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold text-[#3871b1]">Kredi Yönetimi</h1>
      <button
        @click="router.push('/student/credits/buy')"
        class="px-4 py-2 bg-[#ff8913] text-white rounded-lg hover:bg-[#ff8913]/90"
      >
        Kredi Satın Al
      </button>
    </div>

    <!-- Kredi Durumu Kartı -->
    <div class="bg-white rounded-lg border">
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-medium text-gray-500">Mevcut Krediniz</h2>
            <div class="mt-2 flex items-baseline">
              <div class="text-3xl font-bold text-[#3871b1]">{{ balance }}</div>
              <div class="ml-2 text-sm text-gray-500">kredi</div>
            </div>
          </div>
          <div class="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
            <credit-card-icon class="h-6 w-6 text-[#3871b1]" />
          </div>
        </div>
      </div>
      <div class="px-6 py-3 bg-gray-50 border-t">
        <div class="text-sm text-gray-500">
          Her ders 1 kredi değerindedir. Kredi satın almak için sağ üstteki butonu kullanabilirsiniz.
        </div>
      </div>
    </div>

    <!-- İşlem Geçmişi -->
    <div class="bg-white rounded-lg border">
      <div class="px-6 py-4 border-b">
        <h2 class="font-medium">İşlem Geçmişi</h2>
      </div>

      <div v-if="isLoading" class="p-6 text-center text-gray-500">
        Yükleniyor...
      </div>

      <div v-else-if="transactions.length === 0" class="p-6 text-center text-gray-500">
        Henüz bir işlem bulunmuyor.
      </div>

      <div v-else class="divide-y">
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="px-6 py-4"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- İşlem İkonu -->
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center"
                :class="[
                  transaction.type === 'purchase' ? 'bg-green-50' : 
                  transaction.type === 'use' ? 'bg-blue-50' : 'bg-orange-50'
                ]"
              >
                <component 
                  :is="getTransactionIcon(transaction.type)"
                  class="w-5 h-5"
                  :class="[
                    transaction.type === 'purchase' ? 'text-green-600' : 
                    transaction.type === 'use' ? 'text-blue-600' : 'text-orange-600'
                  ]"
                />
              </div>

              <!-- İşlem Detayı -->
              <div>
                <div class="font-medium">
                  {{ getTransactionTitle(transaction) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ formatDate(transaction.created_at) }}
                </div>
              </div>
            </div>

            <!-- Kredi Miktarı -->
            <div 
              class="text-lg font-semibold"
              :class="[
                transaction.type === 'use' ? 'text-red-600' : 'text-green-600'
              ]"
            >
              {{ transaction.type === 'use' ? '-' : '+' }}{{ transaction.amount }}
            </div>
          </div>

          <!-- Paket Detayı -->
          <div 
            v-if="transaction.package"
            class="mt-2 text-sm text-gray-500 ml-14"
          >
            {{ transaction.package.name }} - {{ formatPrice(transaction.price) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  CreditCard as CreditCardIcon,
  ShoppingCart,
  Calendar,
  RefreshCw
} from 'lucide-vue-next'
import { useCredits } from '@/composables/useCredits'
import { useAuthStore } from '@/stores/auth'
import { formatDate, formatPrice } from '@/utils/dateTime'
import type { CreditTransaction } from '@/types/Credit'

const router = useRouter()
const authStore = useAuthStore()
const { 
  balance,
  transactions,
  isLoading,
  fetchBalance,
  fetchTransactions
} = useCredits()

// Transaction Helper Methods
const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'purchase':
      return ShoppingCart
    case 'use':
      return Calendar
    case 'refund':
      return RefreshCw
    default:
      return CreditCardIcon
  }
}

const getTransactionTitle = (transaction: CreditTransaction) => {
  switch (transaction.type) {
    case 'purchase':
      return `${transaction.package?.name} Paketi Satın Alındı`
    case 'use':
      return 'Ders Rezervasyonu'
    case 'refund':
      return 'Kredi İadesi'
    default:
      return transaction.description
  }
}

// Initial Load
onMounted(async () => {
  if (authStore.userId) {
    await Promise.all([
      fetchBalance(authStore.userId),
      fetchTransactions(authStore.userId)
    ])
  }
})
</script>