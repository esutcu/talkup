<template>
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-semibold text-[#3871b1]">Ders Rezervasyonu</h1>
      </div>
  
      <!-- Öğretmen Listesi -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="teacher in teachers"
          :key="teacher.id"
          class="border rounded-lg overflow-hidden hover:border-[#3871b1] transition-colors"
        >
          <div class="p-4">
            <div class="flex items-center gap-4">
              <img 
                :src="teacher.avatar || '/default-avatar.png'" 
                alt="profil"
                class="w-16 h-16 rounded-full object-cover"
              />
              <div class="flex-1">
                <h3 class="font-medium text-[#3871b1]">{{ teacher.name }}</h3>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span 
                    v-for="slot in teacher.availableSlots?.slice(0, 3)"
                    :key="slot"
                    class="px-2 py-1 text-xs bg-blue-50 text-[#3871b1] rounded-full"
                  >
                    {{ formatDateTime(slot) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Aksiyon Butonu -->
          <div class="p-4 bg-gray-50 flex justify-end">
            <button
              @click="selectTeacher(teacher)"
              class="px-4 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
            >
              Müsait Saatleri Gör
            </button>
          </div>
        </div>
      </div>
  
      <!-- Saat Seçim Modalı -->
      <modal-dialog v-model="showModal">
        <div class="p-6 space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-[#3871b1]">Müsait Saatler</h3>
            <button @click="showModal = false">
              <x-icon class="h-5 w-5 text-gray-400" />
            </button>
          </div>
  
          <!-- Tarih Seçici -->
          <input
            type="date"
            v-model="selectedDate"
            class="w-full px-4 py-2 border rounded-lg"
            :min="today"
            @change="fetchSlots"
          />
  
          <!-- Saat Seçimi -->
          <div v-if="selectedTeacher" class="grid grid-cols-4 gap-2">
            <button
              v-for="slot in availableSlots"
              :key="slot.id"
              @click="selectSlot(slot)"
              class="px-4 py-2 text-sm border rounded-lg hover:border-[#3871b1]"
              :class="selectedSlot?.id === slot.id ? 'bg-[#3871b1] text-white' : ''"
            >
              {{ slot.start_time }}
            </button>
          </div>
  
          <!-- Onay Butonu -->
          <div class="flex justify-end gap-4">
            <button
              @click="showModal = false"
              class="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            
            <button
              @click="confirmBooking"
              class="px-6 py-2 bg-[#3871b1] text-white rounded-lg hover:bg-[#3871b1]/90"
              :disabled="!selectedSlot || insufficientCredits"
            >
              {{ insufficientCredits ? 'Yetersiz Kredi' : 'Rezervasyon Yap' }}
            </button>
          </div>
        </div>
      </modal-dialog>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { X as XIcon } from 'lucide-vue-next'
  import { useSupabase } from '@/composables/useSupabase'
  import { useAuthStore } from '@/stores/auth'
  import ModalDialog from '@/components/common/ModalDialog.vue'
  import { formatDateTime } from '@/utils/dateTime'
  
  const router = useRouter()
  const { supabase } = useSupabase()
  const authStore = useAuthStore()
  
  // State
  const teachers = ref([])
  const showModal = ref(false)
  const selectedTeacher = ref(null)
  const selectedDate = ref(new Date().toISOString().split('T')[0])
  const selectedSlot = ref(null)
  const availableSlots = ref([])
  
  // Computed
  const today = computed(() => new Date().toISOString().split('T')[0])
  const insufficientCredits = computed(() => (authStore.user?.credits || 0) < 1)
  
  // Methods
  const fetchTeachers = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, name, avatar')
      .eq('role', 'teacher')
      .eq('status', 'active')
    
    if (data) {
      teachers.value = data
    }
  }
  
  const selectTeacher = (teacher) => {
    selectedTeacher.value = teacher
    selectedSlot.value = null
    showModal.value = true
    fetchSlots()
  }
  
  const fetchSlots = async () => {
    if (!selectedTeacher.value) return
    
    const { data } = await supabase
      .from('slots')
      .select('*')
      .eq('teacher_id', selectedTeacher.value.id)
      .eq('date', selectedDate.value)
      .eq('is_booked', false)
      .order('start_time')
    
    availableSlots.value = data || []
  }
  
  const selectSlot = (slot) => {
    selectedSlot.value = slot
  }
  
  const confirmBooking = async () => {
    if (!selectedTeacher.value || !selectedSlot.value || insufficientCredits.value) return
  
    // Meet linki oluştur
    const meetId = Math.random().toString(36).substring(7)
    const meetLink = `https://meet.google.com/${meetId}`
  
    // Transaction başlat
    const { error: transactionError } = await supabase.rpc('create_booking', {
      p_student_id: authStore.user.id,
      p_teacher_id: selectedTeacher.value.id,
      p_slot_id: selectedSlot.value.id,
      p_meet_link: meetLink
    })
  
    if (!transactionError) {
      showModal.value = false
      router.push('/student/dashboard')
    }
  }
  
  // Initial load
  onMounted(() => {
    fetchTeachers()
  })
  </script>