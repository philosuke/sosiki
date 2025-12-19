<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  isActive?: boolean
  audioData?: Uint8Array | null
  bars?: number
  color?: string
}>(), {
  isActive: false,
  bars: 32,
  color: '#00D4FF',
})

const barHeights = ref<number[]>(Array(props.bars).fill(4))

// Update bar heights based on audio data or generate random animation
watch(
  () => [props.isActive, props.audioData],
  () => {
    if (props.isActive && props.audioData) {
      // Real audio data
      const heights: number[] = []
      for (let i = 0; i < props.bars; i++) {
        const dataIndex = Math.floor((i / props.bars) * props.audioData.length)
        heights.push((props.audioData[dataIndex] / 255) * 48 + 4)
      }
      barHeights.value = heights
    } else if (props.isActive) {
      // Animated random heights
      barHeights.value = Array(props.bars).fill(0).map(() =>
        Math.random() * 40 + 8
      )
    } else {
      barHeights.value = Array(props.bars).fill(4)
    }
  },
  { immediate: true }
)

// Animation loop for random bars when no audio data
let animationFrame: number | null = null

watch(
  () => props.isActive,
  (active) => {
    if (active && !props.audioData) {
      const animate = () => {
        barHeights.value = Array(props.bars).fill(0).map(() =>
          Math.random() * 40 + 8
        )
        animationFrame = requestAnimationFrame(animate)
      }
      // Slow down animation
      const slowAnimate = () => {
        animate()
        setTimeout(() => {
          if (props.isActive) slowAnimate()
        }, 100)
      }
      slowAnimate()
    } else if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex items-center justify-center gap-1 h-12">
    <div
      v-for="(height, i) in barHeights"
      :key="i"
      class="w-1 rounded-full transition-all duration-75"
      :style="{
        height: `${height}px`,
        opacity: isActive ? 1 : 0.3,
        background: `linear-gradient(to top, ${color}80, ${color})`,
        boxShadow: isActive ? `0 0 4px ${color}60` : 'none',
      }"
    />
  </div>
</template>
