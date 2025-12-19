<script setup lang="ts">
import { onMounted } from 'vue'
import MainLayout from './components/layout/MainLayout.vue'
import { useSettingsStore } from './stores/settings'
import { useChatStore } from './stores/chat'

const settingsStore = useSettingsStore()
const chatStore = useChatStore()

onMounted(async () => {
  // Load settings on startup
  await settingsStore.loadSettings()
  // Load conversations
  await chatStore.loadConversations()
})
</script>

<template>
  <MainLayout />
</template>

<style>
/* App-level styles are minimal since we use Tailwind */
#app {
  min-height: 100vh;
  background-color: var(--jarvis-background, #0A0E17);
}
</style>
