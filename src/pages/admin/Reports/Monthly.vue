<template>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-semibold text-[#3871b1]">Aylık Rapor</h1>
        <div class="flex gap-2">
          <div class="flex items-center gap-2">
            <button
              @click="previousMonth"
              class="p-1 rounded-full hover:bg-gray-100"
            >
              <chevron-left-icon class="h-5 w-5" />
            </button>
            <span class="text-sm">{{ formatMonth(currentMonth) }}</span>
            <button
              @click="nextMonth"
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
          title="Toplam Gelir"
          :value="formatPrice(stats.totalRevenue)"
          :change="stats.revenueChange"
          icon="credit-card"
          color="#3871b1"
        />
        <stat-card
          title="Yeni Kullanıcılar"
          :value="stats.newUsers"
          :change="stats.userChange"
          icon="users"
          color="#ff8913"
        />
        <stat-card
          title="Satılan Krediler"
          :value="stats.totalCredits"
          :change="stats.creditChange"
          icon="credit-card"
          color="#3871b1"
        />
        <stat-card
          title="Tamamlanan Dersler"
          :value="stats.completedLessons"
          :change="stats.lessonChange"
          icon="calendar"
          color="#ff8913"
        />
      </div>
  
      <!-- Ana Grafik -->
      <div class="bg-white rounded-lg border">
        <div class="px-6 py-4 border-b flex justify-between items-center">
          <h2 class="font-medium">Aylık Gelir Grafiği</h2>
          <div class="flex">
            <button
              v-for="(type, index) in chartTypes"
              :key="index"
              @click="activeChartType = type"
              class="px-3 py-1 text-sm rounded-lg"
              :class="activeChartType === type 
                ? 'bg-[#3871b1] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              {{ type }}
            </button>
          </div>
        </div>
        <div class="p-6">
          <div style="height: 350px;">
            <monthly-revenue-chart :data="monthlyData" :type="activeChartType" />
          </div>
        </div>
      </div>
  
      <!-- Alt Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- En Çok Satın Alan Kullanıcılar -->
        <div class="bg-white rounded-lg border">
          <div class="px-6 py-4 border-b">
            <h2 class="font-medium">En Çok Satın Alan Kullanıcılar</h2>
          </div>
          <div class="p-4">
            <div class="space-y-4">
              <div 
                v-for="user in topUsers" 
                :key="user.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <img 
                    :src="user.avatar || '/default-avatar.png'" 
                    alt="User" 
                    class="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 class="font-medium text-gray-900">{{ user.name }}</h3>
                    <div class="text-xs text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">{{ formatPrice(user.totalSpent) }}</div>
                  <div class="text-xs text-gray-500">{{ user.transactions }} işlem</div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
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
      </div>
  
      <!-- Paket Performansı -->
      <div class="bg-white rounded-lg border">
        <div class="px-6 py-4 border-b">
          <h2 class="font-medium">Paket Performansı</h2>
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
                  Toplam Gelir
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % Değişim
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="pkg in packagePerformance" :key="pkg.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ pkg.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ pkg.creditAmount }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatPrice(pkg.price) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ pkg.salesCount }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {{ formatPrice(pkg.totalRevenue) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <span 
                    class="px-2 py-1 text-xs rounded-full"
                    :class="pkg.percentChange >= 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'"
                  >
                    {{ pkg.percentChange >= 0 ? '+' : '' }}{{ pkg.percentChange }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- Ders İstatistikleri -->
      <div class="bg-white rounded-lg border">
        <div class="px-6 py-4 border-b">
          <h2 class="font-medium">Ders İstatistikleri</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Tamamlanan Dersler</h3>
            <div class="text-2xl font-bold">{{ stats.completedLessons }}</div>
            <div class="mt-4 text-sm">
              <span 
                :class="stats.lessonChange >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'"
              >
                {{ stats.lessonChange >= 0 ? '+' : '' }}{{ stats.lessonChange }}%
              </span>
              <span class="text-gray-500 ml-1">geçen aya göre</span>
            </div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-500 mb-2">İptal Edilen Dersler</h3>
            <div class="text-2xl font-bold">{{ stats.cancelledLessons }}</div>
            <div class="mt-4 text-sm">
              <span 
                :class="stats.cancelRate <= 5 
                  ? 'text-green-600' 
                  : stats.cancelRate <= 10 
                    ? 'text-yellow-600' 
                    : 'text-red-600'"
              >
                {{ stats.cancelRate }}%
              </span>
              <span class="text-gray-500 ml-1">iptal oranı</span>
            </div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Ortalama Ders / Öğrenci</h3>
            <div class="text-2xl font-bold">{{ stats.avgLessonsPerStudent.toFixed(1) }}</div>
            <div class="mt-4 text-sm">
              <span 
                :class="stats.avgLessonsChange >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'"
              >
                {{ stats.avgLessonsChange >= 0 ? '+' : '' }}{{ stats.avgLessonsChange }}%
              </span>
              <span class="text-gray-500 ml-1">geçen aya göre</span>
            </div>
          </div>
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
  import MonthlyRevenueChart from '@/components/admin/charts/MonthlyRevenueChart.vue'
  import PackageDistributionChart from '@/components/admin/charts/PackageDistributionChart.vue'
  import { 
    formatPrice, 
    formatMonth
  } from '@/utils/dateTime'
  
  const { supabase } = useSupabase()
  
  // State
  const currentMonth = ref(new Date())
  const chartTypes = ['Gelir', 'Krediler', 'Dersler']
  const activeChartType = ref('Gelir')
  const monthlyData = ref([])
  const packageData = ref([])
  const topUsers = ref([])
  const packagePerformance = ref([])
  const stats = ref({
    totalRevenue: 0,
    revenueChange: 0,
    newUsers: 0,
    userChange: 0,
    totalCredits: 0,
    creditChange: 0,
    completedLessons: 0,
    lessonChange: 0,
    cancelledLessons: 0,
    cancelRate: 0,
    avgLessonsPerStudent: 0,
    avgLessonsChange: 0
  })
  
  // Month navigation helpers
  function getMonthStart(date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    return start
  }
  
  function getMonthEnd(date) {
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    end.setHours(23, 59, 59, 999)
    return end
  }
  
  function previousMonth() {
    const newDate = new Date(currentMonth.value)
    newDate.setMonth(newDate.getMonth() - 1)
    currentMonth.value = newDate
    fetchMonthlyReport()
  }
  
  function nextMonth() {
    const newDate = new Date(currentMonth.value)
    newDate.setMonth(newDate.getMonth() + 1)
    currentMonth.value = newDate
    fetchMonthlyReport()
  }
  
  // Methods
  const fetchMonthlyReport = async () => {
    const monthStart = getMonthStart(currentMonth.value)
    const monthEnd = getMonthEnd(currentMonth.value)
    
    const formattedStartDate = monthStart.toISOString()
    const formattedEndDate = monthEnd.toISOString()
    
    // Fetch current month data
    const { data: currentMonthTransactions } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        user:user_id (name, email, avatar),
        package:package_id (name, credit_amount, price)
      `)
      .eq('status', 'completed')
      .gte('created_at', formattedStartDate)
      .lte('created_at', formattedEndDate)
    
    // Fetch previous month data for comparison
    const prevMonthStart = new Date(monthStart)
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1)
    
    const prevMonthEnd = new Date(monthEnd)
    prevMonthEnd.setMonth(prevMonthEnd.getMonth() - 1)
    
    const { data: prevMonthTransactions } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        package:package_id (name, credit_amount, price)
      `)
      .eq('status', 'completed')
      .gte('created_at', prevMonthStart.toISOString())
      .lte('created_at', prevMonthEnd.toISOString())
    
    if (currentMonthTransactions) {
      // Calculate current month stats
      const currentRevenue = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0)
      const currentCredits = currentMonthTransactions.reduce((sum, t) => sum + (t.package?.credit_amount || 0), 0)
      
      // Calculate previous month stats for comparison
      const prevRevenue = prevMonthTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0
      const prevCredits = prevMonthTransactions?.reduce((sum, t) => sum + (t.package?.credit_amount || 0), 0) || 0
      
      // Calculate percent changes
      const revenueChange = prevRevenue === 0 
        ? 100 
        : Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
      
      const creditChange = prevCredits === 0 
        ? 100 
        : Math.round(((currentCredits - prevCredits) / prevCredits) * 100)
      
      // Update stats
      stats.value = {
        ...stats.value,
        totalRevenue: currentRevenue,
        revenueChange: revenueChange,
        totalCredits: currentCredits,
        creditChange: creditChange
      }
      
      // Generate daily data for chart
      const days = []
      const daysInMonth = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 0).getDate()
      
      for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth(), i)
        days.push(day)
      }
      
      monthlyData.value = days.map(day => {
        const dayStart = new Date(day)
        dayStart.setHours(0, 0, 0, 0)
        
        const dayEnd = new Date(day)
        dayEnd.setHours(23, 59, 59, 999)
        
        const dayTransactions = currentMonthTransactions?.filter(t => {
          const tDate = new Date(t.created_at)
          return tDate >= dayStart && tDate <= dayEnd
        }) || []
        
        const dayRevenue = dayTransactions.reduce((sum, t) => sum + t.amount, 0)
        const dayCredits = dayTransactions.reduce((sum, t) => sum + (t.package?.credit_amount || 0), 0)
        
        return {
          date: dayStart.toISOString(),
          day: day.getDate(),
          revenue: dayRevenue,
          credits: dayCredits,
          lessons: 0 // Will be updated with lesson data
        }
      })
      
      // Generate top users
      const userMap = {}
      
      currentMonthTransactions.forEach(t => {
        const userId = t.user_id
        
        if (!userMap[userId]) {
          userMap[userId] = {
            id: userId,
            name: t.user?.name || 'Bilinmeyen Kullanıcı',
            email: t.user?.email || '',
            avatar: t.user?.avatar || null,
            totalSpent: 0,
            transactions: 0
          }
        }
        
        userMap[userId].totalSpent += t.amount
        userMap[userId].transactions += 1
      })
      
      topUsers.value = Object.values(userMap)
        .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
        .slice(0, 5)
      
      // Generate package data
      const packageMap = {}
      const packageSales = {}
      
      currentMonthTransactions.forEach(t => {
        const packageId = t.package_id
        const packageName = t.package?.name || 'Bilinmeyen Paket'
        
        if (!packageMap[packageId]) {
          packageMap[packageId] = {
            value: 0,
            name: packageName
          }
        }
        
        if (!packageSales[packageId]) {
          packageSales[packageId] = {
            id: packageId,
            name: packageName,
            creditAmount: t.package?.credit_amount || 0,
            price: t.package?.price || 0,
            salesCount: 0,
            totalRevenue: 0,
            percentChange: 0
          }
        }
        
        packageMap[packageId].value += 1
        packageSales[packageId].salesCount += 1
        packageSales[packageId].totalRevenue += t.amount
      })
      
      packageData.value = Object.values(packageMap)
      
      // Calculate previous month package sales for comparison
      if (prevMonthTransactions) {
        const prevPackageSales = {}
        
        prevMonthTransactions.forEach(t => {
          const packageId = t.package_id
          
          if (!prevPackageSales[packageId]) {
            prevPackageSales[packageId] = {
              salesCount: 0,
              totalRevenue: 0
            }
          }
          
          prevPackageSales[packageId].salesCount += 1
          prevPackageSales[packageId].totalRevenue += t.amount
        })
        
        // Calculate percent changes for packages
        Object.keys(packageSales).forEach(packageId => {
          const currentSales = packageSales[packageId].totalRevenue
          const prevSales = prevPackageSales[packageId]?.totalRevenue || 0
          
          const change = prevSales === 0 
            ? 100 
            : Math.round(((currentSales - prevSales) / prevSales) * 100)
          
          packageSales[packageId].percentChange = change
        })
      }
      
      packagePerformance.value = Object.values(packageSales)
        .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
    }
    
    // Fetch user data
    const { data: currentMonthUsers } = await supabase
      .from('users')
      .select('count')
      .eq('role', 'student')
      .gte('created_at', formattedStartDate)
      .lte('created_at', formattedEndDate)
    
    const { data: prevMonthUsers } = await supabase
      .from('users')
      .select('count')
      .eq('role', 'student')
      .gte('created_at', prevMonthStart.toISOString())
      .lte('created_at', prevMonthEnd.toISOString())
    
    if (currentMonthUsers && currentMonthUsers[0]) {
      const currentUsers = currentMonthUsers[0].count
      const prevUsers = prevMonthUsers?.[0]?.count || 0
      
      const userChange = prevUsers === 0 
        ? 100 
        : Math.round(((currentUsers - prevUsers) / prevUsers) * 100)
      
      stats.value.newUsers = currentUsers
      stats.value.userChange = userChange
    }
    
    // Fetch lesson data
    const { data: currentMonthCompletedLessons } = await supabase
      .from('bookings')
      .select('count')
      .eq('status', 'completed')
      .gte('date', formattedStartDate.split('T')[0])
      .lte('date', formattedEndDate.split('T')[0])
    
    const { data: prevMonthCompletedLessons } = await supabase
      .from('bookings')
      .select('count')
      .eq('status', 'completed')
      .gte('date', prevMonthStart.toISOString().split('T')[0])
      .lte('date', prevMonthEnd.toISOString().split('T')[0])
    
    const { data: currentMonthCancelledLessons } = await supabase
      .from('bookings')
      .select('count')
      .eq('status', 'cancelled')
      .gte('date', formattedStartDate.split('T')[0])
      .lte('date', formattedEndDate.split('T')[0])
    
    if (currentMonthCompletedLessons && currentMonthCompletedLessons[0]) {
      const completedLessons = currentMonthCompletedLessons[0].count
      const prevCompletedLessons = prevMonthCompletedLessons?.[0]?.count || 0
      const cancelledLessons = currentMonthCancelledLessons?.[0]?.count || 0
      
      const lessonChange = prevCompletedLessons === 0 
        ? 100 
        : Math.round(((completedLessons - prevCompletedLessons) / prevCompletedLessons) * 100)
      
      const totalLessons = completedLessons + cancelledLessons
      const cancelRate = totalLessons === 0 
        ? 0 
        : Math.round((cancelledLessons / totalLessons) * 100)
      
      // Calculate average lessons per student
      const { data: activeStudents } = await supabase
        .from('bookings')
        .select('distinct student_id')
        .gte('date', formattedStartDate.split('T')[0])
        .lte('date', formattedEndDate.split('T')[0])
      
      const { data: prevActiveStudents } = await supabase
        .from('bookings')
        .select('distinct student_id')
        .gte('date', prevMonthStart.toISOString().split('T')[0])
        .lte('date', prevMonthEnd.toISOString().split('T')[0])
      
      const studentCount = activeStudents?.length || 0
      const prevStudentCount = prevActiveStudents?.length || 0
      
      const avgLessons = studentCount === 0 
        ? 0 
        : completedLessons / studentCount
      
      const prevAvgLessons = prevStudentCount === 0 
        ? 0 
        : prevCompletedLessons / prevStudentCount
      
      const avgLessonsChange = prevAvgLessons === 0 
        ? 0 
        : Math.round(((avgLessons - prevAvgLessons) / prevAvgLessons) * 100)
      
      stats.value = {
        ...stats.value,
        completedLessons,
        lessonChange,
        cancelledLessons,
        cancelRate,
        avgLessonsPerStudent: avgLessons,
        avgLessonsChange
      }
      
      // Update lesson data in chart
      const lessonsByDay = {}
      
      const { data: lessons } = await supabase
        .from('bookings')
        .select('date, status')
        .gte('date', formattedStartDate.split('T')[0])
        .lte('date', formattedEndDate.split('T')[0])
        .eq('status', 'completed')
      
      if (lessons) {
        lessons.forEach(lesson => {
          const lessonDate = new Date(lesson.date)
          const day = lessonDate.getDate()
          
          if (!lessonsByDay[day]) {
            lessonsByDay[day] = 0
          }
          
          lessonsByDay[day] += 1
        })
        
        // Update monthlyData with lesson counts
        monthlyData.value = monthlyData.value.map(data => {
          const day = new Date(data.date).getDate()
          return {
            ...data,
            lessons: lessonsByDay[day] || 0
          }
        })
      }
    }
  }
  
  const exportReport = () => {
    // Export report functionality here
    alert('Rapor dışa aktarılıyor...')
  }
  
  // Initial fetch
  onMounted(() => {
    fetchMonthlyReport()
  })
  </script>