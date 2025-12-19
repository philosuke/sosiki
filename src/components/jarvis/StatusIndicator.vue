<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  status: 'online' | 'offline' | 'warning' | 'error' | 'loading'
  label?: string
  size?: 'sm' | 'md' | 'lg'
  showPulse?: boolean
}>(), {
  size: 'md',
  showPulse: true,
})

const statusColors = {
  online: { bg: 'bg-green-500', ring: 'ring-green-500/30', text: 'text-green-400' },
  offline: { bg: 'bg-gray-500', ring: 'ring-gray-500/30', text: 'text-gray-400' },
  warning: { bg: 'bg-yellow-500', ring: 'ring-yellow-500/30', text: 'text-yellow-400' },
  error: { bg: 'bg-red-500', ring: 'ring-red-500/30', text: 'text-red-400' },
  loading: { bg: 'bg-cyan-500', ring: 'ring-cyan-500/30', text: 'text-cyan-400' },
}

const sizeClasses = {
  sm: { dot: 'w-2 h-2', text: 'text-xs' },
  md: { dot: 'w-2.5 h-2.5', text: 'text-sm' },
  lg: { dot: 'w-3 h-3', text: 'text-base' },
}

const colors = computed(() => statusColors[props.status])
const sizes = computed(() => sizeClasses[props.size])
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="relative flex">
      <!-- Pulse ring -->
      <span
        v-if="showPulse && (status === 'online' || status === 'loading')"
        class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
        :class="colors.bg"
      />
      <!-- Dot -->
      <span
        class="relative inline-flex rounded-full ring-2"
        :class="[sizes.dot, colors.bg, colors.ring]"
      >
        <!-- Loading spinner -->
        <span
          v-if="status === 'loading'"
          class="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"
        />
      </span>
    </span>

    <!-- Label -->
    <span v-if="label" :class="[sizes.text, colors.text]">
      {{ label }}
    </span>
  </div>
</template>
