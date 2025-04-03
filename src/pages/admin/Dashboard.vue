# src/pages/admin/Dashboard.vue
<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold text-[#3871b1]">Yönetim Paneli</h1>
      <button 
        class="px-4 py-2 bg-[#ff8913] text-white rounded-lg"
        @click="$router.push('/admin/packages')"
      >
        Paket Yönetimi
      </button>
    </div>

    <!-- İstatistik Kartları -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Öğrenci Sayısı -->
      <div class="border rounded-lg p-4">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-sm text-gray-500">Aktif Öğrenciler</div>
            <div class="text-2xl font-bold text-[#3871b1] mt-1">{{ stats.students }}</div>
          </div>
          <users-icon class="h-6 w-6 text-[#3871b1]" />
        </div>
      </div>

      <!-- Öğretmen Sayısı -->
      <div class="border rounded-lg p-4">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-sm text-gray-500">Aktif Öğretmenler</div>
            <div class="text-2xl font-bold text-[#3871b1] mt-1">{{ stats.teachers }}</div>
          </div>
          <book-icon class="h-6 w-6 text-[#3871b1]" />
        </div>
      </div>

      <!-- Toplam Ders -->
      <div class="border rounded-lg p-4">
        <div class="flex justify-between items-center">
          <div>
            <div class="text-sm text-gray-500">Tamamlanan Dersler</div>
            <div class="text-2xl font-bold text-[#3871b1] mt-1">{{ stats.lessons }}</div>
          </div>
          <calendar-icon class="h-6 w-6 text-[#3871b1]" />
        </div>
      </div>
    </div>

    <!-- Aktif Paketler -->
    <div class="bg-white rounded-lg border">
      <div class="p-4 border-b">
        <h2 class="font-medium">Aktif Paketler</h2>
      </div>
      <div class="p-4">
        <div class="space-y-4">
          <div 
            v-for="pkg in packages" 
            :key="pkg.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <div class="font-medium">{{ pkg.name }}</div>
              <div class="text-sm text-gray-500">{{ pkg.credits }} Kredi - {{ formatPrice(pkg.price) }}</div>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="editPackage(pkg)"
                class="p-1 text-gray-500 hover:text-[#3871b1]"
              >
                <pencil-icon class="h-5 w-5" />
              </button>
              <button
                @click="togglePackageStatus(pkg)"
                class="p-1 text-gray-500 hover:text-[#ff8913]"
              >
                <power-icon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Paket Düzenleme Modalı -->
    <modal-dialog v-model="showPackageModal">
      <div class="p-6 space-y-6">
        <h3 class="text-lg font-medium text-[#3871b1]">
          {{ editingPackage.id ? 'Paketi Düzenle' : 'Yeni Paket' }}
        </h3>

        <form @submit.prevent="savePackage" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Paket Adı</label>
            <input
              v-model="editingPackage.name"
              type="text"
              class="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Kredi</label>
            <input
              v-model.number="editingPackage.credits"
              type="number"
              class="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Fiyat (₺)</label>
            <input
              v-model.number="editingPackage.price"
              type="number"
              class="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="showPackageModal = false"
              class="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg"
            >
              İptal
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-[#3871b1] text-white rounded-lg"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </modal-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Users, Book, Calendar, Pencil, Power } from 'lucide-vue-next'
import { useSupabase } from '@/composables/useSupabase'
import ModalDialog from '@/components/common/ModalDialog.vue'
import { formatPrice } from '@/utils/dateTime'

const { supabase } = useSupabase()

// State
const stats = ref({ students: 0, teachers: 0, lessons: 0 })
const packages = ref([])
const showPackageModal = ref(false)
const editingPackage = ref({ name: '', credits: 0, price: 0 })

// Methods
const fetchStats = async () => {
  // Öğrenci sayısı
  const { data: students } = await supabase
    .from('users')
    .select('count')
    .eq('role', 'student')
    .eq('status', 'active')
    .single()

  // Öğretmen sayısı
  const { data: teachers } = await supabase
    .from('users')
    .select('count')
    .eq('role', 'teacher')
    .eq('status', 'active')
    .single()

  // Ders sayısı
  const { data: lessons } = await supabase
    .from('bookings')
    .select('count')
    .eq('status', 'completed')
    .single()

  stats.value = {
    students: students?.count || 0,
    teachers: teachers?.count || 0,
    lessons: lessons?.count || 0
  }
}

const fetchPackages = async () => {
  const { data } = await supabase
    .from('packages')
    .select('*')
    .order('credits')

  if (data) {
    packages.value = data
  }
}

const editPackage = (pkg) => {
  editingPackage.value = { ...pkg }
  showPackageModal.value = true
}

const savePackage = async () => {
  if (editingPackage.value.id) {
    await supabase
      .from('packages')
      .update(editingPackage.value)
      .eq('id', editingPackage.value.id)
  } else {
    await supabase
      .from('packages')
      .insert(editingPackage.value)
  }

  showPackageModal.value = false
  await fetchPackages()
}

const togglePackageStatus = async (pkg) => {
  await supabase
    .from('packages')
    .update({ is_active: !pkg.is_active })
    .eq('id', pkg.id)

  await fetchPackages()
}

// Initial load
onMounted(() => {
  fetchStats()
  fetchPackages()
})
</script>