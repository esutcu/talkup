# components/admin/StatCard.vue
<template>
  <div 
    class="rounded-lg border border-gray-200 p-4"
    :class="[`border-l-4 border-l-[${color}]`]"
  >
    <div class="flex items-center justify-between pb-2">
      <h2 class="text-sm font-medium">{{ title }}</h2>
      <component 
        :is="iconComponent" 
        class="h-4 w-4"
        :class="`text-[${color}]`"
      />
    </div>
    <div class="text-2xl font-bold">{{ value }}</div>
    <p v-if="change" class="text-xs text-gray-500 mt-1">
      ↑ {{ change }} bu ay
    </p>
    <p v-if="subtitle" class="text-xs text-gray-500 mt-1">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Users,
  CreditCard,
  Calendar,
  ChartBar
} from 'lucide-vue-next'

const props = defineProps<{
  title: string
  value: number
  change?: number
  subtitle?: string
  icon: 'users' | 'credit-card' | 'calendar' | 'chart'
  color: string
}>()

const iconComponent = computed(() => {
  const icons = {
    users: Users,
    'credit-card': CreditCard,
    calendar: Calendar,
    chart: ChartBar
  }
  return icons[props.icon]
})
</script>