<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  color?: string
}>(), {
  max: 100,
  size: 120,
  strokeWidth: 8,
  showLabel: true,
  color: '#00D4FF',
})

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const percentage = computed(() => Math.min(props.value / props.max, 1))
const offset = computed(() => circumference.value - percentage.value * circumference.value)
</script>

<template>
  <div class="relative inline-flex items-center justify-center">
    <svg
      :width="size"
      :height="size"
      class="transform -rotate-90"
    >
      <!-- Background circle -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        stroke="currentColor"
        :stroke-width="strokeWidth"
        class="text-cyan-900/30"
      />

      <!-- Progress circle -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="color"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        stroke-linecap="round"
        class="transition-all duration-500"
        :style="{
          filter: `drop-shadow(0 0 6px ${color}80)`,
        }"
      />
    </svg>

    <!-- Label -->
    <div v-if="showLabel" class="absolute inset-0 flex items-center justify-center">
      <slot>
        <span class="text-lg font-semibold text-cyan-300">
          {{ Math.round(percentage * 100) }}%
        </span>
      </slot>
    </div>
  </div>
</template>
