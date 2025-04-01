<template>
    <Teleport to="body">
      <div class="toast-container">
        <TransitionGroup 
          name="toast"
          tag="div"
          class="toast-list"
        >
          <div
            v-for="toast in toasts"
            :key="toast.id"
            class="toast"
            :class="[`toast-${toast.type}`, { 'visible': toast.visible }]"
            @click="closeToast(toast.id)"
          >
            <div class="toast-icon">
              <check-circle-icon v-if="toast.type === 'success'" class="h-5 w-5" />
              <alert-circle-icon v-else-if="toast.type === 'error'" class="h-5 w-5" />
              <info-icon v-else-if="toast.type === 'info'" class="h-5 w-5" />
              <alert-triangle-icon v-else-if="toast.type === 'warning'" class="h-5 w-5" />
            </div>
            <div class="toast-message">{{ toast.message }}</div>
            <button class="toast-close" @click.stop="closeToast(toast.id)">
              <x-icon class="h-4 w-4" />
            </button>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import useToast from '@/composables/useToast'
  import { 
    CheckCircle as CheckCircleIcon,
    AlertCircle as AlertCircleIcon,
    AlertTriangle as AlertTriangleIcon,
    Info as InfoIcon,
    X as XIcon
  } from 'lucide-vue-next'
  
  const { toasts, close } = useToast()
  
  // Sadece görünür toast'ları göster
  const visibleToasts = computed(() => toasts.value.filter(toast => toast.visible))
  
  // Toast'u kapat
  const closeToast = (id: number) => {
    close(id)
  }
  </script>
  
  <style scoped>
  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    max-width: 24rem;
  }
  
  .toast-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .toast {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    background-color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .toast.visible {
    opacity: 1;
    transform: translateX(0);
  }
  
  .toast-success {
    border-left: 4px solid #10B981;
  }
  
  .toast-error {
    border-left: 4px solid #EF4444;
  }
  
  .toast-info {
    border-left: 4px solid #3871b1;
  }
  
  .toast-warning {
    border-left: 4px solid #F59E0B;
  }
  
  .toast-icon {
    flex-shrink: 0;
    margin-right: 0.75rem;
  }
  
  .toast-success .toast-icon {
    color: #10B981;
  }
  
  .toast-error .toast-icon {
    color: #EF4444;
  }
  
  .toast-info .toast-icon {
    color: #3871b1;
  }
  
  .toast-warning .toast-icon {
    color: #F59E0B;
  }
  
  .toast-message {
    flex: 1;
    font-size: 0.875rem;
  }
  
  .toast-close {
    flex-shrink: 0;
    color: #9CA3AF;
    margin-left: 0.75rem;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
  }
  
  .toast-close:hover {
    color: #4B5563;
  }
  
  /* Transitions */
  .toast-enter-from {
    opacity: 0;
    transform: translateX(100%);
  }
  
  .toast-enter-active {
    transition: all 0.3s ease;
  }
  
  .toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
  }
  
  .toast-leave-active {
    transition: all 0.3s ease;
    position: absolute;
  }
  
  .toast-move {
    transition: transform 0.3s ease;
  }
  </style>