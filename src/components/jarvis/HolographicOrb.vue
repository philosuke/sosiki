<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: number
  isThinking?: boolean
  isActive?: boolean
}>(), {
  size: 128,
  isThinking: false,
  isActive: true,
})

const sizeStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))
</script>

<template>
  <div class="relative" :style="sizeStyle">
    <!-- Outer ring 1 -->
    <div
      class="absolute inset-0 rounded-full border-2 border-cyan-400/30"
      :class="{ 'animate-spin': isActive }"
      style="animation-duration: 8s"
    />

    <!-- Outer ring 2 -->
    <div
      class="absolute inset-2 rounded-full border border-cyan-400/40"
      :class="{ 'animate-spin': isActive }"
      style="animation-duration: 6s; animation-direction: reverse"
    />

    <!-- Outer ring 3 -->
    <div
      class="absolute inset-4 rounded-full border border-cyan-500/50"
      :class="{ 'animate-spin': isActive }"
      style="animation-duration: 4s"
    />

    <!-- Glow effect -->
    <div
      class="absolute inset-6 rounded-full bg-gradient-to-br from-cyan-400/20 to-cyan-600/10 blur-sm"
      :class="{ 'animate-pulse': isThinking }"
    />

    <!-- Core orb -->
    <div
      class="absolute inset-8 rounded-full"
      :class="[
        'bg-gradient-radial from-cyan-400/80 via-cyan-500/40 to-transparent',
        isThinking ? 'animate-pulse-glow' : '',
      ]"
      style="background: radial-gradient(circle, rgba(0, 212, 255, 0.8) 0%, rgba(0, 153, 204, 0.4) 50%, transparent 70%)"
    />

    <!-- Inner highlight -->
    <div
      class="absolute rounded-full bg-white/20"
      style="top: 30%; left: 30%; width: 20%; height: 20%; filter: blur(4px)"
    />

    <!-- Particles -->
    <template v-if="isActive">
      <div
        v-for="i in 6"
        :key="i"
        class="particle absolute w-1 h-1 rounded-full bg-cyan-400"
        :style="{
          top: '50%',
          left: '50%',
          animation: `orbit ${3 + i * 0.5}s linear infinite`,
          animationDelay: `${i * 0.3}s`,
        }"
      />
    </template>
  </div>
</template>

<style scoped>
@keyframes orbit {
  0% {
    transform: rotate(0deg) translateX(40px) rotate(0deg);
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: rotate(360deg) translateX(40px) rotate(-360deg);
    opacity: 0.5;
  }
}

.particle {
  box-shadow: 0 0 6px rgba(0, 212, 255, 0.8);
}

.animate-pulse-glow {
  animation: pulse-glow 1.5s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.8;
    filter: blur(0px);
  }
  50% {
    opacity: 1;
    filter: blur(2px);
  }
}
</style>
