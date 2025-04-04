<template>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-semibold text-[#3871b1]">Öğretmen Yönetimi</h1>
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-[#ff8913] text-white rounded-lg hover:bg-[#ff8913]/90"
        >
          Yeni Öğretmen Ekle
        </button>
      </div>
  
      <!-- Filtreleme -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="relative">
          <search-icon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="İsim veya email ile ara..."
            class="pl-10 pr-4 py-2 w-full border rounded-lg"
          />
        </div>
        <div>
          <select 
            v-model="statusFilter"
            class="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>
      </div>
  
      <!-- Öğretmen Listesi -->
      <div class="bg-white rounded-lg border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Öğretmen</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Toplam Ders</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Durum</th>
                <th class="px-6 py-4 text-right text-sm font-medium text-gray-500">İşlemler</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr 
                v-for="teacher in filteredTeachers" 
                :key="teacher.id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <img 
                      :src="teacher.avatar || '/default-avatar.png'" 
                      class="h-10 w-10 rounded-full object-cover"
                      alt="Avatar"
                    />
                    <div class="ml-4">
                      <div class="font-medium text-gray-900">{{ teacher.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-gray-500">
                  {{ teacher.email }}
                </td>
                <td class="px-6 py-4">
                  <div class="font-medium">{{ teacher.total_lessons || 0 }}</div>
                  <div class="text-sm text-gray-500">Son 30 gün</div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="teacher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  >
                    {{ teacher.status === 'active' ? 'Aktif' : 'Pasif' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                  <button
                    @click="openEditModal(teacher)"
                    class="text-[#3871b1] hover:text-[#3871b1]/80"
                  >
                    <pencil-icon class="h-5 w-5" />
                  </button>
                  <button
                    @click="toggleStatus(teacher)"
                    class="text-gray-400 hover:text-gray-600"
                  >
                    <power-icon class="h-5 w-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- Öğretmen Ekleme/Düzenleme Modalı -->
      <modal-dialog v-model="showModal">
        <div class="p-6 space-y-6">
          <div class="flex items-start justify-between">
            <h3 class="text-lg font-medium text-[#3871b1]">
              {{ editingTeacher ? 'Öğretmen Düzenle' : 'Yeni Öğretmen Ekle' }}
            </h3>
            <button @click="showModal = false">
              <x-icon class="h-5 w-5 text-gray-400" />
            </button>
          </div>
  
          <form @submit.prevent="saveTeacher" class="space-y-4">
            <!-- Ad Soyad -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Ad Soyad</label>
              <input
                v-model="formData.name"
                type="text"
                class="mt-1 block w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
  
            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input
                v-model="formData.email"
                type="email"
                class="mt-1 block w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
  
            <!-- Şifre (Yeni öğretmen eklerken) -->
            <div v-if="!editingTeacher">
              <label class="block text-sm font-medium text-gray-700">Şifre</label>
              <input
                v-model="formData.password"
                type="password"
                class="mt-1 block w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
  
            <!-- Durum -->
            <div class="flex items-center">
              <input
                v-model="formData.status"
                type="checkbox"
                class="h-4 w-4 text-[#3871b1] rounded"
                true-value="active"
                false-value="inactive"
              />
              <label class="ml-2 text-sm text-gray-700">Aktif</label>
            </div>
  
            <!-- Butonlar -->
            <div class="flex justify-end gap-2">
              <button
                type="button"
                @click="showModal = false"
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
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { 
    Search as SearchIcon,
    Pencil as PencilIcon, 
    Power as PowerIcon,
    X as XIcon 
  } from 'lucide-vue-next'
  import { useSupabase } from '@/composables/useSupabase'
  import ModalDialog from '@/components/common/ModalDialog.vue'
  import type { User } from '@/types'
  
  const { supabase } = useSupabase()
  
  // State
  const teachers = ref<User[]>([])
  const showModal = ref(false)
  const editingTeacher = ref<User | null>(null)
  const isSaving = ref(false)
  const isLoading = ref(false)
  const searchQuery = ref('')
  const statusFilter = ref('')
  
  const formData = ref({
    name: '',
    email: '',
    password: '',
    status: 'active' as 'active' | 'inactive'
  })
  
  // Computed
  const filteredTeachers = computed(() => {
    return teachers.value.filter(teacher => {
      const matchesSearch = !searchQuery.value || 
        teacher.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.value.toLowerCase())
      
      const matchesStatus = !statusFilter.value || teacher.status === statusFilter.value
      
      return matchesSearch && matchesStatus
    })
  })
  
  // Methods
  const fetchTeachers = async () => {
    isLoading.value = true
    const { data } = await supabase
      .from('users')
      .select(`
        *,
        total_lessons:bookings(count)
      `)
      .eq('role', 'teacher')
      .order('name')
  
    if (data) {
      teachers.value = data
    }
    isLoading.value = false
  }
  
  const openCreateModal = () => {
    editingTeacher.value = null
    formData.value = {
      name: '',
      email: '',
      password: '',
      status: 'active'
    }
    showModal.value = true
  }
  
  const openEditModal = (teacher: User) => {
    editingTeacher.value = teacher
    formData.value = {
      name: teacher.name,
      email: teacher.email,
      password: '',
      status: teacher.status
    }
    showModal.value = true
  }
  
  const saveTeacher = async () => {
    isSaving.value = true
  
    try {
      if (editingTeacher.value) {
        // Mevcut öğretmeni güncelle
        await supabase
          .from('users')
          .update({
            name: formData.value.name,
            email: formData.value.email,
            status: formData.value.status
          })
          .eq('id', editingTeacher.value.id)
      } else {
        // Yeni öğretmen oluştur
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.value.email,
          password: formData.value.password
        })
  
        if (authError) throw authError
  
        if (authData.user) {
          await supabase.from('users').insert({
            id: authData.user.id,
            name: formData.value.name,
            email: formData.value.email,
            role: 'teacher',
            status: formData.value.status
          })
        }
      }
  
      showModal.value = false
      await fetchTeachers()
    } catch (error) {
      console.error('Teacher save failed:', error)
    }
  
    isSaving.value = false
  }
  
  const toggleStatus = async (teacher: User) => {
    const newStatus = teacher.status === 'active' ? 'inactive' : 'active'
    
    await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', teacher.id)
  
    await fetchTeachers()
  }
  
  // Initial load
  onMounted(() => {
    fetchTeachers()
  })
  </script>