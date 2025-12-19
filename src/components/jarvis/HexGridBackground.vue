<script setup lang="ts">
withDefaults(defineProps<{
  opacity?: number
  color?: string
}>(), {
  opacity: 0.1,
  color: 'currentColor',
})
</script>

<template>
  <svg
    class="absolute inset-0 w-full h-full pointer-events-none"
    :style="{ opacity }"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern
        id="hexagons"
        width="56"
        height="100"
        patternUnits="userSpaceOnUse"
        patternTransform="scale(0.5)"
      >
        <path
          d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66Z"
          fill="none"
          stroke="currentColor"
          stroke-width="0.5"
          class="text-cyan-500"
        />
        <path
          d="M28 100L0 84L0 50L28 34L56 50L56 84L28 100Z"
          fill="none"
          stroke="currentColor"
          stroke-width="0.5"
          class="text-cyan-500"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hexagons)" />
  </svg>
</template>
