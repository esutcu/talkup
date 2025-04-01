# src/pages/admin/Packages.vue
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold text-[#3871b1]">Paket Yönetimi</h1>
      <button
        @click="openCreateModal()"
        class="px-4 py-2 bg-[#ff8913] text-white rounded-lg hover:bg-[#ff8913]/90"
      >
        Yeni Paket Oluştur
      </button>
    </div>

    <!-- Paket Listesi -->
    <div class="bg-white rounded-lg border">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Paket Adı</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Kredi</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Fiyat</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Durum</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">Satış</th>
              <th class="px-6 py-4 text-right text-sm font-medium text-gray-500">İşlemler</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr 
              v-for="pack in packages" 
              :key="pack.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ pack.name }}</div>
                <div class="text-sm text-gray-500">{{ pack.description }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="font-medium">{{ pack.credit_amount }} kredi</div>
                <div class="text-sm text-gray-500">
                  {{ Math.round(pack.price / pack.credit_amount) }}₺/kredi
                </div>
              </td>
              <td class="px-6 py-4 font-medium">
                {{ formatPrice(pack.price) }}
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="pack.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ pack.is_active ? 'Aktif' : 'Pasif' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="font-medium">{{ pack.total_sales || 0 }}</div>
                <div class="text-sm text-gray-500">Son 30 gün</div>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button
                  @click="openEditModal(pack)"
                  class="text-[#3871b1] hover:text-[#3871b1]/80"
                >
                  <pencil-icon class="h-5 w-5" />
                </button>
                <button
                  @click="toggleStatus(pack)"
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

    <!-- Paket Ekleme/Düzenleme Modalı -->
    <modal-dialog v-model="showModal">
      <div class="p-6 space-y-6">
        <div class="flex items-start justify-between">
          <h3 class="text-lg font-medium text-[#3871b1]">
            {{ editingPackage ? 'Paketi Düzenle' : 'Yeni Paket Oluştur' }}
          </h3>
          <button @click="showModal = false">
            <x-icon class="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form @submit.prevent="savePackage" class="space-y-4">
          <!-- Paket Adı -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Paket Adı</label>
            <input
              v-model="formData.name"
              type="text"
              class="mt-1 block w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <!-- Kredi Miktarı -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Kredi Miktarı</label>
            <input
              v-model.number="formData.credit_amount"
              type="number"
              min="1"
              class="mt-1 block w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <!-- Fiyat -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Fiyat (₺)</label>
            <input
              v-model.number="formData.price"
              type="number"
              min="0"
              step="0.01"
              class="mt-1 block w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <!-- Açıklama -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Açıklama</label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="mt-1 block w-full px-3 py-2 border rounded-lg"
            ></textarea>
          </div>

          <!-- Durum -->
          <div class="flex items-center">
            <input
              v-model="formData.is_active"
              type="checkbox"
              class="h-4 w-4 text-[#3871b1] rounded"
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
import { ref, onMounted } from 'vue'
import { 
  Pencil as PencilIcon, 
  Power as PowerIcon,
  X as XIcon 
} from 'lucide-vue-next'
import { useSupabase } from '@/composables/useSupabase'
import ModalDialog from '@/components/common/ModalDialog.vue'
import { formatPrice } from '@/utils/dateTime'
import type { CreditPackage } from '@/types/Credit'

const { supabase } = useSupabase()

// State
const packages = ref<CreditPackage[]>([])
const showModal = ref(false)
const editingPackage = ref<CreditPackage | null>(null)
const isSaving = ref(false)

const formData = ref({
  name: '',
  credit_amount: 1,
  price: 0,
  description: '',
  is_active: true
})

// Methods
const fetchPackages = async () => {
  const { data } = await supabase
    .from('packages')
    .select('*, sales:credit_transactions(count)')
    .order('credit_amount')

  if (data) {
    packages.value = data.map(pack => ({
      ...pack,
      total_sales: pack.sales?.[0]?.count || 0
    }))
  }
}

const openCreateModal = () => {
  editingPackage.value = null
  formData.value = {
    name: '',
    credit_amount: 1,
    price: 0,
    description: '',
    is_active: true
  }
  showModal.value = true
}

const openEditModal = (pack: CreditPackage) => {
  editingPackage.value = pack
  formData.value = {
    name: pack.name,
    credit_amount: pack.credit_amount,
    price: pack.price,
    description: pack.description || '',
    is_active: pack.is_active
  }
  showModal.value = true
}

const savePackage = async () => {
  isSaving.value = true

  try {
    if (editingPackage.value) {
      // Güncelleme
      await supabase
        .from('packages')
        .update(formData.value)
        .eq('id', editingPackage.value.id)
    } else {
      // Yeni paket
      await supabase
        .from('packages')
        .insert(formData.value)
    }

    showModal.value = false
    await fetchPackages()
  } catch (error) {
    console.error('Package save failed:', error)
  }

  isSaving.value = false
}

const toggleStatus = async (pack: CreditPackage) => {
  await supabase
    .from('packages')
    .update({ is_active: !pack.is_active })
    .eq('id', pack.id)

  await fetchPackages()
}

// Initial load
onMounted(() => {
  fetchPackages()
})
</script>