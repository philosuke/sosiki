<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Minus, Square, X, Maximize2 } from 'lucide-vue-next'

const isMaximized = ref(false)

onMounted(async () => {
  isMaximized.value = await window.electronAPI.window.isMaximized()
  window.electronAPI.window.onMaximizedChange((maximized) => {
    isMaximized.value = maximized
  })
})

async function minimize() {
  await window.electronAPI.window.minimize()
}

async function maximize() {
  await window.electronAPI.window.maximize()
  isMaximized.value = await window.electronAPI.window.isMaximized()
}

async function close() {
  await window.electronAPI.window.close()
}
</script>

<template>
  <header class="h-10 flex items-center justify-between px-4 bg-jarvis-surface/50 border-b border-jarvis-border drag-region">
    <!-- Logo and title -->
    <div class="flex items-center gap-3 no-drag">
      <div class="flex items-center gap-2">
        <!-- Logo icon -->
        <div class="w-6 h-6 relative">
          <div class="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 opacity-80" />
          <div class="absolute inset-1 rounded-full bg-jarvis-background" />
          <div class="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-400/80 to-cyan-500/40" />
        </div>
        <span class="font-semibold text-cyan-300 tracking-wider text-glow">
          CLAUDIS
        </span>
        <span class="text-xs text-jarvis-text-muted">v1.0</span>
      </div>
    </div>

    <!-- Center spacer (for dragging) -->
    <div class="flex-1" />

    <!-- Window controls -->
    <div class="flex items-center gap-1 no-drag">
      <button
        class="p-2 hover:bg-jarvis-surface-hover rounded-md transition-colors text-jarvis-text-secondary hover:text-jarvis-text-primary"
        @click="minimize"
        title="Minimize"
      >
        <Minus class="w-4 h-4" />
      </button>

      <button
        class="p-2 hover:bg-jarvis-surface-hover rounded-md transition-colors text-jarvis-text-secondary hover:text-jarvis-text-primary"
        @click="maximize"
        title="Maximize"
      >
        <component :is="isMaximized ? Maximize2 : Square" class="w-4 h-4" />
      </button>

      <button
        class="p-2 hover:bg-red-500/20 rounded-md transition-colors text-jarvis-text-secondary hover:text-red-400"
        @click="close"
        title="Close"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </header>
</template>
