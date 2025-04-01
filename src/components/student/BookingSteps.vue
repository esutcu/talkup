<template>
    <div class="space-y-8">
      <!-- Step Indicators -->
      <div class="flex items-center justify-between">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="flex flex-col items-center space-y-2 flex-1"
        >
          <!-- Connection Line -->
          <div class="hidden sm:flex w-full items-center" v-if="index !== 0">
            <div
              class="h-0.5 w-full"
              :class="[
                currentStep > index 
                  ? 'bg-[#3871b1]' 
                  : 'bg-gray-200'
              ]"
            ></div>
          </div>
          
          <!-- Step Circle -->
          <div
            class="flex items-center justify-center w-8 h-8 rounded-full"
            :class="[
              currentStep > index
                ? 'bg-[#3871b1] text-white'
                : currentStep === index
                  ? 'bg-blue-100 text-[#3871b1] border border-[#3871b1]'
                  : 'bg-gray-100 text-gray-500'
            ]"
          >
            <!-- Completed Step -->
            <check-icon 
              v-if="currentStep > index" 
              class="w-5 h-5" 
            />
            
            <!-- Current or Future Step -->
            <span v-else>{{ index + 1 }}</span>
          </div>
          
          <!-- Step Label -->
          <div class="text-xs text-center mt-2 whitespace-nowrap">
            {{ step.label }}
          </div>
        </div>
      </div>
      
      <!-- Step Content -->
      <div>
        <keep-alive>
          <component 
            :is="currentComponent" 
            v-bind="currentComponentProps"
            @next="handleNext"
            @back="handleBack"
          />
        </keep-alive>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, shallowRef } from 'vue'
  import { Check as CheckIcon } from 'lucide-vue-next'
  import TeacherList from './TeacherList.vue'
  import AvailableSlots from './AvailableSlots.vue'
  import BookingConfirm from './BookingConfirm.vue'
  import type { Teacher } from '@/types/User'
  
  // Props
  const props = defineProps({
    initialStep: {
      type: Number,
      default: 0
    },
    flowType: {
      type: String as () => 'byTeacher' | 'byTime',
      default: 'byTeacher'
    }
  })
  
  // Emits
  const emit = defineEmits(['complete'])
  
  // Steps
  const steps = [
    { id: 'select-type', label: 'Öğretmen/Zaman' },
    { id: 'select-teacher', label: 'Öğretmen Seç' },
    { id: 'select-slot', label: 'Saat Seç' },
    { id: 'confirm', label: 'Onayla' }
  ]
  
  // State
  const currentStep = ref(props.initialStep)
  const selectedTeacher = ref<Teacher | null>(null)
  const selectedDate = ref<Date | null>(null)
  const selectedTime = ref<string | null>(null)
  
  // Current step component
  const currentComponent = computed(() => {
    if (props.flowType === 'byTeacher') {
      // Teacher-first flow
      switch (currentStep.value) {
        case 0:
          return shallowRef(TeacherList)
        case 1:
          return shallowRef(AvailableSlots)
        case 2:
          return shallowRef(BookingConfirm)
        default:
          return null
      }
    } else {
      // Time-first flow
      switch (currentStep.value) {
        case 0:
          return shallowRef(AvailableSlots)
        case 1:
          return shallowRef(TeacherList)
        case 2:
          return shallowRef(BookingConfirm)
        default:
          return null
      }
    }
  })
  
  // Component props
  const currentComponentProps = computed(() => {
    if (props.flowType === 'byTeacher') {
      // Teacher-first flow
      switch (currentStep.value) {
        case 0:
          return {}
        case 1:
          return { teacherId: selectedTeacher.value?.id }
        case 2:
          return {
            teacher: selectedTeacher.value,
            date: selectedDate.value,
            time: selectedTime.value
          }
        default:
          return {}
      }
    } else {
      // Time-first flow
      switch (currentStep.value) {
        case 0:
          return {}
        case 1:
          return {
            selectedDate: selectedDate.value,
            selectedTime: selectedTime.value
          }
        case 2:
          return {
            teacher: selectedTeacher.value,
            date: selectedDate.value,
            time: selectedTime.value
          }
        default:
          return {}
      }
    }
  })
  
  // Methods
  const handleNext = (data: any) => {
    // Save selected data based on current step
    if (props.flowType === 'byTeacher') {
      // Teacher-first flow
      switch (currentStep.value) {
        case 0:
          selectedTeacher.value = data
          break
        case 1:
          selectedDate.value = data.date
          selectedTime.value = data.time
          break
        case 2:
          // Booking completed
          emit('complete', {
            teacher: selectedTeacher.value,
            date: selectedDate.value,
            time: selectedTime.value
          })
          return
      }
    } else {
      // Time-first flow
      switch (currentStep.value) {
        case 0:
          selectedDate.value = data.date
          selectedTime.value = data.time
          break
        case 1:
          selectedTeacher.value = data
          break
        case 2:
          // Booking completed
          emit('complete', {
            teacher: selectedTeacher.value,
            date: selectedDate.value,
            time: selectedTime.value
          })
          return
      }
    }
    
    // Move to next step
    if (currentStep.value < steps.length - 1) {
      currentStep.value++
    }
  }
  
  const handleBack = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }
  </script>