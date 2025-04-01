<template>
    <div v-if="loading" class="loading-container" :class="[overlay ? 'loading-overlay' : '']">
      <div class="loading-spinner">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle
            class="path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke-width="5"
          ></circle>
        </svg>
        <div v-if="message" class="loading-message">{{ message }}</div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps({
    loading: {
      type: Boolean,
      default: false
    },
    overlay: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ''
    }
  })
  </script>
  
  <style scoped>
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100px;
  }
  
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 9999;
  }
  
  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .spinner {
    animation: rotate 2s linear infinite;
    width: 50px;
    height: 50px;
  }
  
  .path {
    stroke: #3871b1;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }
  
  .loading-message {
    font-size: 0.875rem;
    color: #374151;
    margin-top: 0.5rem;
  }
  
  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
  
  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
  </style>