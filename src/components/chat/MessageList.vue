<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import MessageItem from './MessageItem.vue'
import type { ChatMessage } from '../../types/chat'

const props = defineProps<{
  messages: ChatMessage[]
  isLoading: boolean
  isStreaming: boolean
}>()

const containerRef = ref<HTMLElement | null>(null)

// Auto-scroll to bottom on new messages
watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight
    }
  }
)

// Also scroll when streaming content updates
watch(
  () => props.messages[props.messages.length - 1]?.content,
  async () => {
    if (props.isStreaming) {
      await nextTick()
      if (containerRef.value) {
        containerRef.value.scrollTop = containerRef.value.scrollHeight
      }
    }
  }
)
</script>

<template>
  <div ref="containerRef" class="p-4 space-y-4">
    <!-- Empty state -->
    <div
      v-if="messages.length === 0 && !isLoading"
      class="flex flex-col items-center justify-center h-full text-center py-20"
    >
      <div class="w-24 h-24 mb-6 relative">
        <div class="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-cyan-600/10 animate-pulse" />
        <div class="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-400/40 to-cyan-500/20" />
        <div class="absolute inset-8 rounded-full bg-cyan-400/60" />
      </div>
      <h2 class="text-xl font-semibold text-cyan-300 mb-2">
        CLAUDISへようこそ
      </h2>
      <p class="text-jarvis-text-secondary max-w-md">
        メッセージを入力するか、マイクボタンを押して音声で話しかけてください。
      </p>
    </div>

    <!-- Messages -->
    <MessageItem
      v-for="message in messages"
      :key="message.id"
      :message="message"
      :is-streaming="isStreaming && message === messages[messages.length - 1] && message.role === 'assistant'"
    />

    <!-- Loading indicator -->
    <div v-if="isLoading && messages[messages.length - 1]?.role !== 'assistant'" class="flex gap-3">
      <div class="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
        <div class="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />
      </div>
      <div class="flex-1 bg-muted/50 rounded-lg p-4 border border-border animate-pulse">
        <div class="flex gap-1">
          <div class="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 0ms" />
          <div class="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 150ms" />
          <div class="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style="animation-delay: 300ms" />
        </div>
      </div>
    </div>
  </div>
</template>
