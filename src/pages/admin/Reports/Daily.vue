<template>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-semibold text-[#3871b1]">Günlük Rapor</h1>
        <div class="flex gap-2">
          <date-picker
            v-model="selectedDate"
            class="w-full max-w-xs"
            @update:model-value="fetchDailyReport"
          />
          <button
            @click="exportReport"
            class="px-4 py-2 bg-[#ff8913] text-white rounded-lg hover:bg-[#ff8913]/90"
          >
            <download-icon class="h-4 w-4 mr-2 inline-block" />
            Dışa Aktar
          </button>
        </div>
      </div>
  
      <!-- İstatistik Kartları -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <stat-card
          title="Toplam Satış"
          :value="formatPrice(stats.totalSales)"
          icon="credit-card"
          color="#3871b1"
        />
        <stat-card
          title="Satılan Kredi"
          :value="stats.totalCredits"
          icon="credit-card"
          color="#ff8913"
        />
        <stat-card
          title="Yeni Kullanıcılar"
          :value="stats.newUsers"
          icon="users"
          color="#3871b1"
        />
        <stat-card
          title="Dersler"
          :value="stats.completedLessons"
          icon="calendar"
          color="#ff8913"
        />
      </div>
  
      <!-- Grafik Kartı -->
      <div class="bg-white rounded-lg border">
        <div class="px-6 py-4 border-b">
          <h2 class="font-medium">Satış Grafiği (Saatlik)</h2>
        </div>
        <div class="p-6">
          <div style="height: 300px;">
            <daily-sales-chart :data="hourlyData" />
          </div>
        </div>
      </div>
  
      <!-- Satış Listesi -->
      <div class="bg-white rounded-lg border">
        <div class="px-6 py-4 border-b flex justify-between items-center">
          <h2 class="font-medium">Satışlar</h2>
          <div class="text-sm text-gray-500">
            {{ selectedDate ? formatDate(selectedDate) : 'Bugün' }}
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paket
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="transaction in transactions" :key="transaction.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatTime(transaction.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ transaction.userName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ transaction.packageName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {{ formatPrice(transaction.amount) }}
                </td>
              </tr>
              <tr v-if="transactions.length === 0">
                <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                  Seçilen tarihte satış bulunmuyor
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { Download as DownloadIcon } from 'lucide-vue-next'
  import { useSupabase } from '@/composables/useSupabase'
  import DatePicker from '@/components/common/DatePicker.vue'
  import StatCard from '@/components/admin/StatCard.vue'
  import DailySalesChart from '@/components/admin/charts/DailySalesChart.vue'
  import { formatPrice, formatDate, formatTime } from '@/utils/dateTime'
  
  const { supabase } = useSupabase()
  
  // State
  const selectedDate = ref(new Date())
  const transactions = ref([])
  const hourlyData = ref([])
  const stats = ref({
    totalSales: 0,
    totalCredits: 0,
    newUsers: 0,
    completedLessons: 0
  })
  
  // Methods
  const fetchDailyReport = async () => {
    const date = selectedDate.value
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    const formattedStartDate = startOfDay.toISOString()
    const formattedEndDate = endOfDay.toISOString()
    
    // Fetch sales transactions
    const { data: transactionData } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        user:user_id (name, email),
        package:package_id (name, credit_amount)
      `)
      .eq('status', 'completed')
      .gte('created_at', formattedStartDate)
      .lte('created_at', formattedEndDate)
      .order('created_at', { ascending: false })
    
    if (transactionData) {
      transactions.value = transactionData.map(t => ({
        ...t,
        userName: t.user?.name || 'Bilinmeyen Kullanıcı',
        packageName: t.package?.name || 'Bilinmeyen Paket'
      }))
      
      // Calculate total sales
      stats.value.totalSales = transactionData.reduce((sum, t) => sum + t.amount, 0)
      
      // Calculate total credits
      stats.value.totalCredits = transactionData.reduce((sum, t) => sum + (t.package?.credit_amount || 0), 0)
    }
    
    // Fetch new users
    const { data: newUsersData } = await supabase
      .from('users')
      .select('count')
      .gte('created_at', formattedStartDate)
      .lte('created_at', formattedEndDate)
    
    if (newUsersData && newUsersData[0]) {
      stats.value.newUsers = newUsersData[0].count
    }
    
    // Fetch completed lessons
    const { data: lessonsData } = await supabase
      .from('bookings')
      .select('count')
      .eq('status', 'completed')
      .gte('date', formattedStartDate.split('T')[0])
      .lte('date', formattedEndDate.split('T')[0])
    
    if (lessonsData && lessonsData[0]) {
      stats.value.completedLessons = lessonsData[0].count
    }
    
    // Generate hourly data for chart
    const hours = Array.from({ length: 24 }, (_, i) => i)
    
    hourlyData.value = hours.map(hour => {
      const hourStart = new Date(date)
      hourStart.setHours(hour, 0, 0, 0)
      
      const hourEnd = new Date(date)
      hourEnd.setHours(hour, 59, 59, 999)
      
      const hourTransactions = transactionData?.filter(t => {
        const tDate = new Date(t.created_at)
        return tDate >= hourStart && tDate <= hourEnd
      }) || []
      
      const hourTotal = hourTransactions.reduce((sum, t) => sum + t.amount, 0)
      
      return {
        hour: `${hour}:00`,
        sales: hourTotal,
        count: hourTransactions.length
      }
    })
  }
  
  const exportReport = () => {
    // Export report functionality here
    alert('Rapor dışa aktarılıyor...')
  }
  
  // Initial fetch
  onMounted(() => {
    fetchDailyReport()
  })
  </script>