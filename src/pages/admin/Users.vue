<template>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-semibold text-[#3871b1]">Kullanıcı Yönetimi</h1>
        <div class="flex gap-2">
          <button
            @click="addNewUser"
            class="px-4 py-2 bg-[#ff8913] text-white rounded-lg hover:bg-[#ff8913]/90"
          >
            <user-plus-icon class="h-4 w-4 mr-2 inline-block" />
            Yeni Kullanıcı
          </button>
          <button
            @click="exportUsers"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <download-icon class="h-4 w-4 mr-2 inline-block" />
            Dışa Aktar
          </button>
        </div>
      </div>
  
      <!-- Filtreleme Araçları -->
      <div class="bg-white rounded-lg border p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Arama -->
          <div class="relative">
            <search-icon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Kullanıcı ara..."
              class="pl-10 pr-4 py-2 w-full border rounded-lg"
              @input="applyFilters"
            />
          </div>
  
          <!-- Rol Filtresi -->
          <div>
            <select 
              v-model="filters.role"
              class="w-full px-3 py-2 border rounded-lg"
              @change="applyFilters"
            >
              <option value="">Tüm Roller</option>
              <option value="student">Öğrenci</option>
              <option value="teacher">Öğretmen</option>
              <option value="admin">Admin</option>
            </select>
          </div>
  
          <!-- Durum Filtresi -->
          <div>
            <select 
              v-model="filters.status"
              class="w-full px-3 py-2 border rounded-lg"
              @change="applyFilters"
            >
              <option value="">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">İnaktif</option>
              <option value="suspended">Askıya Alınmış</option>
            </select>
          </div>
  
          <!-- Kayıt Tarihi Filtresi -->
          <div>
            <select 
              v-model="filters.createdAt"
              class="w-full px-3 py-2 border rounded-lg"
              @change="applyFilters"
            >
              <option value="">Tüm Zamanlar</option>
              <option value="today">Bugün</option>
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
              <option value="year">Bu Yıl</option>
            </select>
          </div>
        </div>
      </div>
  
      <!-- Kullanıcı Listesi -->
      <div class="bg-white rounded-lg border">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-posta
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                      <img
                        :src="user.avatar || '/default-avatar.png'"
                        alt=""
                        class="h-10 w-10 rounded-full object-cover"
                      />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                      <div v-if="user.surname" class="text-sm text-gray-500">{{ user.surname }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ user.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getRoleBadgeClass(user.role)"
                  >
                    {{ getRoleText(user.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getStatusBadgeClass(user.status)"
                  >
                    {{ getStatusText(user.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="editUser(user)"
                    class="text-[#3871b1] hover:text-[#3871b1]/80"
                  >
                    <pencil-icon class="h-5 w-5" />
                  </button>
                  <button
                    @click="viewUserDetails(user)"
                    class="ml-3 text-gray-400 hover:text-gray-600"
                  >
                    <eye-icon class="h-5 w-5" />
                  </button>
                </td>
              </tr>
              
              <!-- No results -->
              <tr v-if="filteredUsers.length === 0">
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                  <div v-if="isLoading">Kullanıcılar yükleniyor...</div>
                  <div v-else>
                    <div class="text-gray-500">Kullanıcı bulunamadı</div>
                    <button 
                      @click="clearFilters"
                      class="mt-2 text-sm text-[#3871b1] hover:underline"
                    >
                      Filtreleri Temizle
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="px-6 py-3 border-t flex items-center justify-between">
          <div class="text-sm text-gray-500">
            {{ totalRecordsText }}
          </div>
          <div class="flex gap-2">
            <button
              @click="prevPage"
              :disabled="pagination.page === 1"
              class="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
              :class="pagination.page === 1 ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-100'"
            >
              Önceki
            </button>
            <div class="px-3 py-1 text-sm">
              {{ pagination.page }} / {{ totalPages }}
            </div>
            <button
              @click="nextPage"
              :disabled="pagination.page === totalPages"
              class="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
              :class="pagination.page === totalPages ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-100'"
            >
              Sonraki
            </button>
          </div>
        </div>
      </div>
  
      <!-- User Edit Modal -->
      <modal-dialog v-model="showEditModal">
        <div class="p-6 space-y-6">
          <div class="flex items-start justify-between">
            <h3 class="text-lg font-medium text-[#3871b1]">
              {{ editingUser.id ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı' }}
            </h3>
            <button @click="showEditModal = false">
              <x-icon class="h-5 w-5 text-gray-400" />
            </button>
          </div>
          
          <!-- User Form -->
          <form @submit.prevent="saveUser" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Ad -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Ad</label>
                <input
                  v-model="editingUser.name"
                  type="text"
                  class="mt-1 block w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <!-- Soyad -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Soyad</label>
                <input
                  v-model="editingUser.surname"
                  type="text"
                  class="mt-1 block w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            
            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700">E-posta</label>
              <input
                v-model="editingUser.email"
                type="email"
                class="mt-1 block w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Rol -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Rol</label>
                <select
                  v-model="editingUser.role"
                  class="mt-1 block w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="student">Öğrenci</option>
                  <option value="teacher">Öğretmen</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <!-- Durum -->
              <div>
                <label class="block text-sm font-medium text-gray-700">Durum</label>
                <select
                  v-model="editingUser.status"
                  class="mt-1 block w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">İnaktif</option>
                  <option value="suspended">Askıya Alınmış</option>
                </select>
              </div>
            </div>
            
            <!-- Kredi (sadece öğrenciler için) -->
            <div v-if="editingUser.role === 'student'">
              <label class="block text-sm font-medium text-gray-700">Kredi</label>
              <input
                v-model.number="editingUser.credits"
                type="number"
                min="0"
                class="mt-1 block w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <!-- Biyografi (sadece öğretmenler için) -->
            <div v-if="editingUser.role === 'teacher'">
              <label class="block text-sm font-medium text-gray-700">Biyografi</label>
              <textarea
                v-model="editingUser.bio"
                rows="3"
                class="mt-1 block w-full px-3 py-2 border rounded-lg"
              ></textarea>
            </div>
            
            <!-- Şifre (sadece yeni kullanıcı için) -->
            <div v-if="!editingUser.id">
              <label class="block text-sm font-medium text-gray-700">Şifre</label>
              <input
                v-model="editingUser.password"
                type="password"
                class="mt-1 block w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            
            <!-- Kaydet/İptal -->
            <div class="flex justify-end gap-2">
              <button
                type="button"
                @click="showEditModal = false"
                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
                :disabled="isSaving"
              >
                {{ isSaving ? 'Kaydediliyor...' : 'Kaydet' }}
              </button>
            </div>
          </form>
        </div>
      </modal-dialog>
      
      <!-- User Details Modal -->
      <modal-dialog v-model="showDetailsModal" max-width="max-w-2xl">
        <div class="p-6 space-y-6">
          <div class="flex items-start justify-between">
            <h3 class="text-lg font-medium text-[#3871b1]">
              Kullanıcı Bilgileri
            </h3>
            <button @click="showDetailsModal = false">
              <x-icon class="h-5 w-5 text-gray-400" />
            </button>
          </div>
          
          <div v-if="selectedUser" class="space-y-6">
            <!-- User Header -->
            <div class="flex items-center gap-4">
              <img
                :src="selectedUser.avatar || '/default-avatar.png'"
                alt=""
                class="h-20 w-20 rounded-full object-cover"
              />
              <div>
                <h2 class="text-xl font-medium text-gray-900">
                  {{ selectedUser.name }} {{ selectedUser.surname }}
                </h2>
                <div class="flex items-center gap-2 mt-1">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getRoleBadgeClass(selectedUser.role)"
                  >
                    {{ getRoleText(selectedUser.role) }}
                  </span>
                  <span class="text-sm text-gray-500">
                    {{ selectedUser.email }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-500">Kayıt Tarihi</div>
                <div class="text-lg font-medium">{{ formatDate(selectedUser.created_at) }}</div>
              </div>
              
              <div v-if="selectedUser.role === 'student'" class="p-4 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-500">Kredi Bakiyesi</div>
                <div class="text-lg font-medium">{{ selectedUser.credits }} kredi</div>
              </div>
              
              <div v-if="selectedUser.role === 'student'" class="p-4 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-500">Toplam Dersler</div>
                <div class="text-lg font-medium">{{ userStats.totalLessons }}</div>
              </div>
              
              <div v-if="selectedUser.role === 'teacher'" class="p-4 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-500">Verilen Dersler</div>
                <div class="text-lg font-medium">{{ userStats.totalLessons }}</div>
              </div>
              
              <div v-if="selectedUser.role === 'teacher'" class="p-4 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-500">Müsait Saatler</div>
                <div class="text-lg font-medium">{{ userStats.availableSlots }}</div>
              </div>
            </div>
            
            <!-- Biyografi (öğretmen) -->
            <div v-if="selectedUser.role === 'teacher' && selectedUser.bio" class="p-4 bg-gray-50 rounded-lg">
              <div class="text-sm font-medium mb-2">Biyografi</div>
              <p class="text-sm text-gray-600">{{ selectedUser.bio }}</p>
            </div>
            
            <!-- Reservations / Transactions Tab -->
            <div class="border-b">
              <div class="flex space-x-8">
                <button
                  v-for="tab in userDetailTabs"
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  class="py-2 px-1 -mb-px text-sm font-medium border-b-2"
                  :class="[
                    activeTab === tab.id
                      ? 'border-[#3871b1] text-[#3871b1]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  {{ tab.name }}
                </button>
              </div>
            </div>
            
            <!-- Tab Content -->
            <div>
              <!-- Reservations -->
              <div v-if="activeTab === 'reservations'" class="space-y-3">
                <div v-if="userBookings.length === 0" class="text-center py-4 text-gray-500">
                  Henüz rezervasyon bulunmuyor
                </div>
                <div 
                  v-for="booking in userBookings" 
                  :key="booking.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div class="font-medium">
                      {{ selectedUser.role === 'student' ? booking.teacherName : booking.studentName }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ formatDate(booking.date) }} - {{ booking.start_time }}
                    </div>
                  </div>
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="getBookingStatusClass(booking.status)"
                  >
                    {{ getBookingStatusText(booking.status) }}
                  </span>
                </div>
              </div>
              
              <!-- Transactions -->
              <div v-if="activeTab === 'transactions'" class="space-y-3">
                <div v-if="userTransactions.length === 0" class="text-center py-4 text-gray-500">
                  Henüz işlem bulunmuyor
                </div>
                <div 
                  v-for="transaction in userTransactions" 
                  :key="transaction.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div class="font-medium">
                      {{ getTransactionTypeText(transaction.type) }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ formatDate(transaction.created_at) }}
                    </div>
                  </div>
                  <div 
                    class="text-lg font-semibold"
                    :class="transaction.type === 'use' ? 'text-red-600' : 'text-green-600'"
                  >
                    {{ transaction.type === 'use' ? '-' : '+' }}{{ transaction.amount }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </modal-dialog>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { 
    Search as SearchIcon,
    UserPlus as UserPlusIcon,
    Download as DownloadIcon,
    Pencil as PencilIcon,
    Eye as EyeIcon,
    X as XIcon
  } from 'lucide-vue-next'
  import { useSupabase } from '@/composables/useSupabase'
  import ModalDialog from '@/components/common/ModalDialog.vue'
  import { formatDate } from '@/utils/dateTime'
  import type { User } from '@/types/User'
  
  const { supabase } = useSupabase()
  
  // State
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const filters = ref({
    search: '',
    role: '',
    status: '',
    createdAt: ''
  })
  const pagination = ref({
    page: 1,
    pageSize: 10
  })
  const showEditModal = ref(false)
  const showDetailsModal = ref(false)
  const editingUser = ref<any>({})
  const selectedUser = ref<User | null>(null)
  const activeTab = ref('reservations')
  const userBookings = ref([])
  const userTransactions = ref([])
  const userStats = ref({
    totalLessons: 0,
    availableSlots: 0
  })
  const isSaving = ref(false)
  
  // User detail tabs
  const userDetailTabs = [
    { id: 'reservations', name: 'Rezervasyonlar' },
    { id: 'transactions', name: 'Kredi İşlemleri' }
  ]
  
  // Computed
  const filteredUsers = computed(() => {
    let filtered = users.value
  
    // Apply filters
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(search) || 
        (user.surname && user.surname.toLowerCase().includes(search)) || 
        user.email.toLowerCase().includes(search)
      )
    }
  
    if (filters.value.role) {
      filtered = filtered.filter(user => user.role === filters.value.role)
    }
  
    if (filters.value.status) {
      filtered = filtered.filter(user => user.status === filters.value.status)
    }
  
    if (filters.value.createdAt) {
      const now = new Date()
      let compareDate = new Date()
  
      switch (filters.value.createdAt) {
        case 'today':
          compareDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          compareDate.setDate(compareDate.getDate() - 7)
          break
        case 'month':
          compareDate.setMonth(compareDate.getMonth() - 1)
          break
        case 'year':
          compareDate.setFullYear(compareDate.getFullYear() - 1)
          break
      }
  
      filtered = filtered.filter(user => new Date(user.created_at) >= compareDate)
    }
  
    // Apply pagination
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
  
    return filtered.slice(start, end)
  })
  
  const totalPages = computed(() => {
    const total = filteredUsers.value.length
    return Math.ceil(total / pagination.value.pageSize) || 1
  })
  
  const totalRecordsText = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.pageSize + 1
    const end = Math.min(start + pagination.value.pageSize - 1, users.value.length)
    return `${start}-${end} / ${users.value.length} kullanıcı`
  })
  
  // Methods
  const fetchUsers = async () => {
    isLoading.value = true
  
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
  
      if (error) throw error
      users.value = data || []
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  const applyFilters = () => {
    pagination.value.page = 1
  }
  
  const clearFilters = () => {
    filters.value = {
      search: '',
      role: '',
      status: '',
      createdAt: ''
    }
    applyFilters()
  }
  
  const prevPage = () => {
    if (pagination.value.page > 1) {
      pagination.value.page--
    }
  }
  
  const nextPage = () => {
    if (pagination.value.page < totalPages.value) {
      pagination.value.page++
    }
  }
  
  const addNewUser = () => {
    editingUser.value = {
      name: '',
      surname: '',
      email: '',
      role: 'student',
      status: 'active',
      credits: 0,
      bio: '',
      password: ''
    }
    showEditModal.value = true
  }
  
  const editUser = (user: User) => {
    editingUser.value = { ...user }
    showEditModal.value = true
  }
  
  const saveUser = async () => {
    isSaving.value = true
  
    try {
      if (editingUser.value.id) {
        // Update existing user
        const { id, password, ...updateData } = editingUser.value
        
        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', id)
  
        if (error) throw error
      } else {
        // Create new user
        // In a real app, we'd use auth.signUp here as well
        const { password, ...userData } = editingUser.value
        
        const { error } = await supabase
          .from('users')
          .insert(userData)
  
        if (error) throw error
      }
  
      await fetchUsers()
      showEditModal.value = false
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Kullanıcı kaydedilirken bir hata oluştu.')
    } finally {
      isSaving.value = false
    }
  }
  
  const viewUserDetails = async (user: User) => {
    selectedUser.value = user
    activeTab.value = 'reservations'
    showDetailsModal.value = true
    
    // Fetch user details (bookings, transactions)
    await Promise.all([
      fetchUserBookings(user.id),
      fetchUserTransactions(user.id),
      fetchUserStats(user.id, user.role)
    ])
  }
  
  const fetchUserBookings = async (userId: string) => {
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        student:student_id (name),
        teacher:teacher_id (name)
      `)
      .or(`student_id.eq.${userId},teacher_id.eq.${userId}`)
      .order('date', { ascending: false })
      .limit(10)
  
    if (data) {
      userBookings.value = data.map(booking => ({
        ...booking,
        studentName: booking.student?.name || 'Bilinmeyen Öğrenci',
        teacherName: booking.teacher?.name || 'Bilinmeyen Öğretmen'
      }))
    } else {
      userBookings.value = []
    }
  }
  
  const fetchUserTransactions = async (userId: string) => {
    const { data } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
  
    userTransactions.value = data || []
  }
  
  const fetchUserStats = async (userId: string, role: string) => {
    // Reset stats
    userStats.value = {
      totalLessons: 0,
      availableSlots: 0
    }
  
    if (role === 'student' || role === 'teacher') {
      // Fetch lesson count
      const field = role === 'student' ? 'student_id' : 'teacher_id'
      const { data: lessonData } = await supabase
        .from('bookings')
        .select('count')
        .eq(field, userId)
        .eq('status', 'completed')
  
      if (lessonData && lessonData[0]) {
        userStats.value.totalLessons = lessonData[0].count
      }
    }
  
    if (role === 'teacher') {
      // Fetch available slots
      const { data: slotData } = await supabase
        .from('slots')
        .select('count')
        .eq('teacher_id', userId)
        .eq('is_available', true)
        .gte('date', new Date().toISOString().split('T')[0])
  
      if (slotData && slotData[0]) {
        userStats.value.availableSlots = slotData[0].count
      }
    }
  }
  
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'teacher':
        return 'bg-blue-100 text-blue-800'
      case 'student':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin'
      case 'teacher':
        return 'Öğretmen'
      case 'student':
        return 'Öğrenci'
      default:
        return role
    }
  }
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif'
      case 'inactive':
        return 'İnaktif'
      case 'suspended':
        return 'Askıya Alınmış'
      default:
        return status
    }
  }
  
  const getBookingStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getBookingStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif'
      case 'completed':
        return 'Tamamlandı'
      case 'cancelled':
        return 'İptal Edildi'
      default:
        return status
    }
  }
  
  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'Kredi Satın Alma'
      case 'use':
        return 'Ders Rezervasyonu'
      case 'refund':
        return 'İade'
      default:
        return type
    }
  }
  
  const exportUsers = () => {
    alert('Kullanıcılar dışa aktarılıyor...')
    // Gerçek uygulamada CSV veya Excel olarak dışa aktarma işlemi yapılacak
  }
  
  // Initial load
  onMounted(() => {
    fetchUsers()
  })
  </script>