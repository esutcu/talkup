# AdminDashboard.vue
<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-[#3871b1]">Yönetim Paneli</h1>
      <button 
        class="px-4 py-2 bg-[#ff8913] hover:bg-[#ff8913]/90 text-white rounded-lg"
        @click="router.push('/admin/packages/new')"
      >
        Yeni Paket Oluştur
      </button>
    </div>

    <!-- Ana İstatistikler -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <!-- Aktif Öğrenciler -->
      <stat-card
        title="Aktif Öğrenciler"
        :value="stats.activeStudents"
        :change="stats.studentChange"
        icon="users"
        color="#3871b1"
      />

      <!-- Aktif Öğretmenler -->
      <stat-card
        title="Aktif Öğretmenler"
        :value="stats.activeTeachers"
        :change="stats.teacherChange"
        icon="users"
        color="#ff8913"
      />

      <!-- Toplam Satılan Kredi -->
      <stat-card
        title="Satılan Kredi"
        :value="stats.totalCredits"
        subtitle="Bu ay"
        icon="credit-card"
        color="#3871b1"
      />

      <!-- Tamamlanan Dersler -->
      <stat-card
        title="Tamamlanan Dersler"
        :value="stats.completedLessons"
        subtitle="Bu ay"
        icon="calendar"
        color="#ff8913"
      />
    </div>

    <!-- Aktif Paketler -->
    <div class="rounded-lg border border-gray-200">
      <div class="p-4 border-b flex justify-between items-center">
        <h2 class="font-medium">Aktif Paketler</h2>
        <button 
          class="px-4 py-2 bg-[#3871b1] hover:bg-[#3871b1]/90 text-white rounded-lg"
          @click="router.push('/admin/packages')"
        >
          Paketleri Düzenle
        </button>
      </div>
      <div class="p-4">
        <div class="space-y-4">
          <div 
            v-for="package in activePackages" 
            :key="package.id"
            class="flex items-center p-4 bg-gray-50 rounded-lg"
          >
            <package-icon class="h-8 w-8 text-[#ff8913]" />
            <div class="ml-4 flex-1">
              <h3 class="font-medium text-[#3871b1]">{{ package.name }}</h3>
              <div class="flex items-center mt-1 text-sm text-gray-500">
                <span>{{ package.credits }} Kredi • {{ formatPrice(package.price) }} • {{ package.activeUsers }} Aktif Kullanıcı</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium">Son 7 Gün</div>
              <div class="text-2xl font-bold text-[#3871b1]">{{ package.weeklySales }} Satış</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alt Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Hızlı Raporlar -->
      <div class="rounded-lg border border-gray-200">
        <div class="p-4 border-b">
          <h2 class="font-medium">Hızlı Raporlar</h2>
        </div>
        <div class="p-4 space-y-2">
          <button 
            v-for="report in quickReports"
            :key="report.path"
            class="w-full flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg"
            @click="router.push(report.path)"
          >
            <component :is="report.icon" class="h-4 w-4 mr-2" />
            {{ report.title }}
          </button>
        </div>
      </div>

      <!-- Son İşlemler -->
      <div class="rounded-lg border border-gray-200">
        <div class="p-4 border-b">
          <h2 class="font-medium">Son İşlemler</h2>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div 
              v-for="transaction in recentTransactions" 
              :key="transaction.id"
              class="flex items-center text-sm"
            >
              <component 
                :is="transaction.icon" 
                class="h-4 w-4 mr-2"
                :class="transaction.iconColor"
              />
              <span class="flex-1">{{ transaction.description }}</span>
              <span class="text-gray-500">{{ formatTimeAgo(transaction.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Package as PackageIcon,
  BarChart,
  TrendingUp,
  CreditCard,
  Users,
  Calendar
} from 'lucide-vue-next'
import { useSupabase } from '@/composables/useSupabase'
import StatCard from '@/components/admin/StatCard.vue'
import type { Package } from '@/types/Package'
import { formatPrice, formatTimeAgo } from '@/utils/dateTime'

const router = useRouter()
const { supabase } = useSupabase()

// State
const stats = ref({
  activeStudents: 0,
  studentChange: 0,
  activeTeachers: 0,
  teacherChange: 0,
  totalCredits: 0,
  completedLessons: 0
})

const activePackages = ref<Package[]>([])

const quickReports = [
  { 
    title: 'Günlük Satış Raporu',
    path: '/admin/reports/daily',
    icon: BarChart
  },
  { 
    title: 'Aylık Performans Raporu',
    path: '/admin/reports/monthly',
    icon: TrendingUp
  }
]

const recentTransactions = ref([
  {
    id: 1,
    description: 'Yeni paket satın alındı - Premium',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    icon: CreditCard,
    iconColor: 'text-[#3871b1]'
  },
  {
    id: 2,
    description: 'Yeni öğretmen kaydı',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    icon: Users,
    iconColor: 'text-[#ff8913]'
  }
])

// Methods
const fetchStats = async () => {
  // Aktif öğrenci sayısı
  const { data: students } = await supabase
    .from('users')
    .select('count')
    .eq('role', 'student')
    .eq('status', 'active')

  // Aktif öğretmen sayısı
  const { data: teachers } = await supabase
    .from('users')
    .select('count')
    .eq('role', 'teacher')
    .eq('status', 'active')

  // Bu ayki satılan krediler
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0,0,0,0)
  
  const { data: credits } = await supabase
    .from('credit_transactions')
    .select('sum(amount)')
    .gte('created_at', startOfMonth.toISOString())

  // Bu ay tamamlanan dersler
  const { data: lessons } = await supabase
    .from('lessons')
    .select('count')
    .gte('start_time', startOfMonth.toISOString())
    .lt('start_time', new Date().toISOString())
    .eq('status', 'completed')

  stats.value = {
    activeStudents: students?.[0]?.count || 0,
    studentChange: 12,
    activeTeachers: teachers?.[0]?.count || 0,
    teacherChange: 2,
    totalCredits: credits?.[0]?.sum || 0,
    completedLessons: lessons?.[0]?.count || 0
  }
}

const fetchActivePackages = async () => {
  const { data, error } = await supabase
    .from('packages')
    .select(`
      *,
      active_users:users(count)
    `)
    .eq('status', 'active')

  if (data && !error) {
    activePackages.value = data
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchStats(),
    fetchActivePackages()
  ])
})
</script>