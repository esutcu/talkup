<template>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-semibold text-[#3871b1]">Haftalık Rapor</h1>
        <div class="flex gap-2">
          <div class="flex items-center gap-2">
            <button
              @click="previousWeek"
              class="p-1 rounded-full hover:bg-gray-100"
            >
              <chevron-left-icon class="h-5 w-5" />
            </button>
            <span class="text-sm">{{ formatDateRange(weekStart, weekEnd) }}</span>
            <button
              @click="nextWeek"
              class="p-1 rounded-full hover:bg-gray-100"
            >
              <chevron-right-icon class="h-5 w-5" />
            </button>
          </div>
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
          subtitle="Bu Hafta"
          icon="credit-card"
          color="#3871b1"
        />
        <stat-card
          title="Satılan Kredi"
          :value="stats.totalCredits"
          subtitle="Bu Hafta"
          icon="credit-card"
          color="#ff8913"
        />
        <stat-card
          title="Ortalama Satış"
          :value="formatPrice(stats.averageSales)"
          subtitle="Günlük"
          icon="chart"
          color="#3871b1"
        />
        <stat-card
          title="Tamamlanan Dersler"
          :value="stats.completedLessons"
          subtitle="Bu Hafta"
          icon="calendar"
          color="#ff8913"
        />
      </div>
  
      <!-- Grafik Kartı -->
      <div class="bg-white rounded-lg border">
        <div class="px-6 py-4 border-b">
          <h2 class="font-medium">Haftalık Satış Grafiği</h2>
        </div>
        <div class="p-6">
          <div style="height: 300px;">
            <weekly-sales-chart :data="dailyData" />
          </div>
        </div>
      </div>
  
      <!-- Alt Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Paket Dağılımı -->
        <div class="bg-white rounded-lg border">
          <div class="px-6 py-4 border-b">
            <h2 class="font-medium">Paket Dağılımı</h2>
          </div>
          <div class="p-6">
            <div style="height: 250px;">
              <package-distribution-chart :data="packageData" />
            </div>
          </div>
        </div>
  
        <!-- Günlük Satış Tablosu -->
        <div class="bg-white rounded-lg border">
          <div class="px-6 py-4 border-b">
            <h2 class="font-medium">Günlük Satışlar</h2>
          </div>
          <div class="p-4">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="pb-2 text-left text-xs font-medium text-gray-500">Gün</th>
                  <th class="pb-2 text-left text-xs font-medium text-gray-500">Satışlar</th>
                  <th class="pb-2 text-right text-xs font-medium text-gray-500">Tutar</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="day in dailyData" :key="day.date" class="border-b last:border-b-0">
                  <td class="py-3 text-sm">{{ formatShortDate(day.date) }}</td>
                  <td class="py-3 text-sm">{{ day.count }} satış</td>
                  <td class="py-3 text-sm text-right font-medium">{{ formatPrice(day.sales) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
  
      <!-- En Çok Satan Paketler -->
      <div class="bg-white rounded-lg border">
        <div class="px-6 py-4 border-b">
          <h2 class="font-medium">En Çok Satan Paketler</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paket Adı
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kredi
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiyat
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Satış Sayısı
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam Satış
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="pkg in topPackages" :key="pkg.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ pkg.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ pkg.credit_amount }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatPrice(pkg.price) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ pkg.sales }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {{ formatPrice(pkg.totalSales) }}
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
  import { 
    Download as DownloadIcon, 
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon
  } from 'lucide-vue-next'
  import { useSupabase } from '@/composables/useSupabase'
  import StatCard from '@/components/admin/StatCard.vue'
  import WeeklySalesChart from '@/components/admin/charts/WeeklySalesChart.vue'
  import PackageDistributionChart from '@/components/admin/charts/PackageDistributionChart.vue'
  import { 
    formatPrice, 
    formatDate, 
    formatShortDate, 
    formatDateRange,
    formatWeekday
  } from '@/utils/dateTime'
  
  const { supabase } = useSupabase()
  
  // State
  const weekStart = ref(getWeekStart(new Date()))
  const weekEnd = ref(getWeekEnd(new Date()))
  const dailyData = ref([])
  const packageData = ref([])
  const topPackages = ref([])
  const stats = ref({
    totalSales: 0,
    totalCredits: 0,
    averageSales: 0,
    completedLessons: 0
  })
  
  // Week navigation helpers
  function getWeekStart(date) {
    const start = new Date(date)
    const day = start.getDay() || 7 // Convert Sunday (0) to 7
    if (day !== 1) start.setDate(start.getDate() - (day - 1))
    start.setHours(0, 0, 0, 0)
    return start
  }
  
  function getWeekEnd(date) {
    const end = getWeekStart(date)
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return end
  }
  
  function previousWeek() {
    const newStart = new Date(weekStart.value)
    newStart.setDate(newStart.getDate() - 7)
    weekStart.value = newStart
    weekEnd.value = getWeekEnd(newStart)
    fetchWeeklyReport()
  }
  
  function nextWeek() {
    const newStart = new Date(weekStart.value)
    newStart.setDate(newStart.getDate() + 7)
    weekStart.value = newStart
    weekEnd.value = getWeekEnd(newStart)
    fetchWeeklyReport()
  }
  
  // Methods
  const fetchWeeklyReport = async () => {
    const formattedStartDate = weekStart.value.toISOString()
    const formattedEndDate = weekEnd.value.toISOString()
    
    // Fetch sales transactions
    const { data: transactionData } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        package:package_id (name, credit_amount, price)
      `)
      .eq('status', 'completed')
      .gte('created_at', formattedStartDate)
      .lte('created_at', formattedEndDate)
    
    if (transactionData) {
      // Calculate stats
      stats.value.totalSales = transactionData.reduce((sum, t) => sum + t.amount, 0)
      stats.value.totalCredits = transactionData.reduce((sum, t) => sum + (t.package?.credit_amount || 0), 0)
      stats.value.averageSales = stats.value.totalSales / 7
      
      // Generate daily data for chart
      const days = []
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart.value)
        day.setDate(day.getDate() + i)
        days.push(day)
      }
      
      dailyData.value = days.map(day => {
        const dayStart = new Date(day)
        dayStart.setHours(0, 0, 0, 0)
        
        const dayEnd = new Date(day)
        dayEnd.setHours(23, 59, 59, 999)
        
        const dayTransactions = transactionData?.filter(t => {
          const tDate = new Date(t.created_at)
          return tDate >= dayStart && tDate <= dayEnd
        }) || []
        
        const daySales = dayTransactions.reduce((sum, t) => sum + t.amount, 0)
        
        return {
          date: dayStart.toISOString(),
          day: formatWeekday(dayStart),
          sales: daySales,
          count: dayTransactions.length
        }
      })
      
      // Generate package distribution data
      const packageCounts = {}
      const packageDetails = {}
      
      transactionData.forEach(t => {
        const packageId = t.package_id
        const packageName = t.package?.name || 'Bilinmeyen Paket'
        
        packageCounts[packageId] = (packageCounts[packageId] || 0) + 1
        
        if (!packageDetails[packageId]) {
          packageDetails[packageId] = {
            id: packageId,
            name: packageName,
            credit_amount: t.package?.credit_amount || 0,
            price: t.package?.price || 0,
            sales: 0,
            totalSales: 0
          }
        }
        
        packageDetails[packageId].sales += 1
        packageDetails[packageId].totalSales += t.amount
      })
      
      packageData.value = Object.keys(packageCounts).map(id => ({
        name: packageDetails[id].name,
        value: packageCounts[id]
      }))
      
      topPackages.value = Object.values(packageDetails)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5)
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
  }
  
  const exportReport = () => {
    // Export report functionality here
    alert('Rapor dışa aktarılıyor...')
  }
  
  // Initial fetch
  onMounted(() => {
    fetchWeeklyReport()
  })
  </script>