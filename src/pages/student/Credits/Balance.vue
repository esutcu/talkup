<template>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-semibold text-[#3871b1]">Kredi Bakiyesi</h1>
        <router-link
          to="/student/credits/buy"
          class="px-4 py-2 bg-[#ff8913] text-white rounded-lg hover:bg-[#ff8913]/90"
        >
          Kredi Satın Al
        </router-link>
      </div>
  
      <!-- Kredi Durumu Kartı -->
      <div class="bg-white rounded-lg border">
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-sm font-medium text-gray-500">Mevcut Krediniz</h2>
              <div class="mt-2 flex items-baseline">
                <div class="text-3xl font-bold text-[#3871b1]">{{ credits }}</div>
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
  
      <!-- Kredi Kullanım Grafiği -->
      <div class="bg-white rounded-lg border">
        <div class="px-6 py-4 border-b">
          <h2 class="font-medium">Kredi Kullanımı</h2>
        </div>
        <div class="p-6">
          <div style="height: 250px;">
            <credit-usage-chart :data="usageData" />
          </div>
        </div>
      </div>
  
      <!-- Son İşlemler -->
      <div class="bg-white rounded-lg border">
        <div class="px-6 py-4 border-b flex justify-between items-center">
          <h2 class="font-medium">Son İşlemler</h2>
          <router-link
            to="/student/credits/history"
            class="text-sm text-[#3871b1] hover:text-[#3871b1]/90"
          >
            Tüm İşlemleri Gör
          </router-link>
        </div>
        <div class="divide-y">
          <div
            v-for="transaction in recentTransactions"
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
  
          <!-- Veri yoksa -->
          <div v-if="recentTransactions.length === 0" class="px-6 py-8 text-center text-gray-500">
            Henüz bir işlem bulunmuyor. Kredi satın alarak başlayabilirsiniz.
          </div>
        </div>
      </div>
  
      <!-- Kredi Paketleri -->
      <div class="bg-white rounded-lg border">
        <div class="px-6 py-4 border-b">
          <h2 class="font-medium">Kredi Paketleri</h2>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              v-for="pkg in packages"
              :key="pkg.id"
              class="border rounded-lg overflow-hidden hover:border-[#3871b1] transition-colors"
              :class="{'border-[#3871b1] shadow-lg': pkg.recommended}"
            >
              <div v-if="pkg.recommended" class="bg-[#3871b1] text-white text-center py-1 text-sm font-medium">
                Önerilen
              </div>
              <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-800">{{ pkg.name }}</h3>
                <div class="text-sm text-gray-500 mt-1">{{ pkg.credit_amount }} kredi</div>
                <div class="text-2xl font-bold text-[#3871b1] mt-2">{{ formatPrice(pkg.price) }}</div>
                <router-link
                  :to="`/student/credits/buy?package=${pkg.id}`"
                  class="mt-4 w-full block text-center py-2 rounded-lg font-medium transition-colors"
                  :class="pkg.recommended ? 'bg-[#ff8913] hover:bg-[#ff8913]/90 text-white' : 'border border-[#3871b1] text-[#3871b1] hover:bg-[#3871b1] hover:text-white'"
                >
                  Satın Al
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { 
    CreditCard as CreditCardIcon,
    ShoppingCart,
    Calendar,
    RefreshCw
  } from 'lucide-vue-next'
  import { useCredits } from '@/composables/useCredits'
  import { useAuthStore } from '@/stores/auth'
  import CreditUsageChart from '@/components/student/CreditUsageChart.vue'
  import { formatDate, formatPrice } from '@/utils/dateTime'
  import type { CreditTransaction } from '@/types/Credit'
  
  const authStore = useAuthStore()
  const { 
    balance,
    transactions,
    fetchBalance,
    fetchTransactions
  } = useCredits()
  
  // State
  const credits = ref(0)
  const recentTransactions = ref<CreditTransaction[]>([])
  const usageData = ref([])
  const packages = ref([])
  
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
  
  // Methods
  const loadData = async () => {
    if (authStore.userId) {
      // Kredi bakiyesini getir
      await fetchBalance(authStore.userId)
      credits.value = balance.value
  
      // Son işlemleri getir
      await fetchTransactions(authStore.userId)
      recentTransactions.value = transactions.value.slice(0, 5) // Son 5 işlem
  
      // Kullanım grafiği verilerini hazırla
      prepareUsageData()
    }
  }
  
  const fetchPackages = async () => {
    const { data } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('credit_amount')
  
    if (data) {
      // Orta paketi "önerilen" olarak işaretle
      const recommended = Math.floor(data.length / 2)
      packages.value = data.map((pkg, index) => ({
        ...pkg,
        recommended: index === recommended
      }))
    }
  }
  
  const prepareUsageData = () => {
    // Son 6 ayın kredi kullanım verilerini oluştur
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(month)
    }
    
    usageData.value = months.map(month => {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
      
      // Bu ay içindeki işlemleri filtrele
      const monthTransactions = transactions.value.filter(t => {
        const tDate = new Date(t.created_at)
        return tDate >= monthStart && tDate <= monthEnd
      })
      
      // Bu ay içindeki satın almalar ve kullanımları hesapla
      const purchased = monthTransactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + t.amount, 0)
        
      const used = monthTransactions
        .filter(t => t.type === 'use')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      return {
        month: month.toLocaleDateString('tr-TR', { month: 'short' }),
        purchased,
        used
      }
    })
  }
  
  // Initial load
  onMounted(() => {
    loadData()
    fetchPackages()
  })
  </script>