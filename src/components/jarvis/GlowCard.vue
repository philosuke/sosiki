<script setup lang="ts">
import { cn } from '../../lib/utils'

withDefaults(defineProps<{
  variant?: 'default' | 'accent' | 'subtle'
  hover?: boolean
  glow?: boolean
}>(), {
  variant: 'default',
  hover: true,
  glow: false,
})
</script>

<template>
  <div
    :class="cn(
      'relative rounded-lg border backdrop-blur-sm transition-all duration-300',
      variant === 'default' && 'bg-jarvis-surface/80 border-jarvis-border',
      variant === 'accent' && 'bg-orange-500/5 border-orange-400/30',
      variant === 'subtle' && 'bg-jarvis-surface/40 border-jarvis-border/50',
      hover && 'hover:border-cyan-400/50 hover:bg-jarvis-surface',
      glow && 'shadow-glow'
    )"
  >
    <!-- Top accent line -->
    <div
      class="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
    />

    <slot />

    <!-- Corner accents -->
    <div class="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400/30 rounded-tl-lg" />
    <div class="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400/30 rounded-tr-lg" />
    <div class="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400/30 rounded-bl-lg" />
    <div class="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400/30 rounded-br-lg" />
  </div>
</template>
