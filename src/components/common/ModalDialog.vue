<template>
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="modelValue"
          class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          @click="handleBackdropClick"
        >
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div
              v-if="modelValue"
              class="bg-white rounded-lg shadow-xl w-full max-w-md relative"
              :class="[maxWidth]"
              @click.stop
            >
              <div v-if="showCloseButton" class="absolute top-4 right-4">
                <button
                  @click="close"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <x-icon class="h-5 w-5" />
                </button>
              </div>
              
              <slot />
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </template>
  
  <script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
  import { X as XIcon } from 'lucide-vue-next'
  
  // Props
  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true
    },
    closeOnBackdrop: {
      type: Boolean,
      default: true
    },
    closeOnEsc: {
      type: Boolean,
      default: true
    },
    showCloseButton: {
      type: Boolean,
      default: false
    },
    maxWidth: {
      type: String,
      default: 'max-w-md'
    }
  })
  
  // Emits
  const emit = defineEmits(['update:modelValue', 'close'])
  
  // State
  const isOpen = ref(props.modelValue)
  
  // Methods
  const close = () => {
    emit('update:modelValue', false)
    emit('close')
  }
  
  const handleBackdropClick = () => {
    if (props.closeOnBackdrop) {
      close()
    }
  }
  
  const handleEsc = (event: KeyboardEvent) => {
    if (props.closeOnEsc && event.key === 'Escape' && isOpen.value) {
      close()
    }
  }
  
  // ESC tuşu dinlemesi
  onMounted(() => {
    document.addEventListener('keydown', handleEsc)
  })
  
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleEsc)
  })
  
  // Modal açıldığında body scroll'u devre dışı bırak
  watch(() => props.modelValue, (newValue) => {
    isOpen.value = newValue
    
    if (newValue) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  })
  </script>