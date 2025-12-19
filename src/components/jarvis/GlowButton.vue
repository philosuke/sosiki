<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '../../lib/utils'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'accent' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
}>(), {
  variant: 'default',
  size: 'md',
  disabled: false,
  loading: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const classes = computed(() => {
  const baseClasses = [
    'relative overflow-hidden inline-flex items-center justify-center',
    'font-medium transition-all duration-300 rounded-lg',
    'focus:outline-none focus:ring-2 focus:ring-cyan-400/50',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'group',
  ]

  const variantClasses = {
    default: [
      'border border-cyan-400/50 bg-cyan-500/10 text-cyan-300',
      'hover:bg-cyan-500/20 hover:shadow-glow',
    ],
    accent: [
      'border border-orange-400/50 bg-orange-500/10 text-orange-300',
      'hover:bg-orange-500/20 hover:shadow-glow-accent',
    ],
    ghost: [
      'text-cyan-300 hover:bg-cyan-500/10',
    ],
    outline: [
      'border border-cyan-400/30 text-cyan-300',
      'hover:border-cyan-400/60 hover:bg-cyan-500/5',
    ],
  }

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2',
    icon: 'h-10 w-10',
  }

  return cn(
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size]
  )
})
</script>

<template>
  <button
    :class="classes"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <svg
        class="animate-spin h-5 w-5 text-current"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </span>

    <!-- Content -->
    <span :class="{ 'opacity-0': loading }" class="relative z-10 flex items-center gap-2">
      <slot />
    </span>

    <!-- Shimmer effect -->
    <div
      class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
             -translate-x-full group-hover:translate-x-full
             transition-transform duration-700 ease-in-out"
    />
  </button>
</template>
