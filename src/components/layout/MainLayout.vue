<script setup lang="ts">
import { ref } from 'vue'
import TitleBar from './TitleBar.vue'
import Sidebar from '../sidebar/Sidebar.vue'
import ChatView from '../chat/ChatView.vue'
import HexGridBackground from '../jarvis/HexGridBackground.vue'

const sidebarCollapsed = ref(false)
</script>

<template>
  <div class="h-screen flex flex-col bg-jarvis-background overflow-hidden relative">
    <!-- Background effects -->
    <HexGridBackground :opacity="0.05" />

    <!-- Scan lines effect -->
    <div class="absolute inset-0 pointer-events-none scanlines" />

    <!-- Title bar -->
    <TitleBar />

    <!-- Main content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <Sidebar
        :collapsed="sidebarCollapsed"
        @toggle="sidebarCollapsed = !sidebarCollapsed"
      />

      <!-- Chat area -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <ChatView />
      </main>
    </div>
  </div>
</template>
