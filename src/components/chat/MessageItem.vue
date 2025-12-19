<script setup lang="ts">
import { computed } from 'vue'
import { User, Bot, Volume2, Copy, Check } from 'lucide-vue-next'
import { ref } from 'vue'
import MarkdownRenderer from './MarkdownRenderer.vue'
import type { ChatMessage } from '../../types/chat'
import { useVoiceStore } from '../../stores/voice'
import { formatTime } from '../../lib/utils'

const props = defineProps<{
  message: ChatMessage
  isStreaming?: boolean
}>()

const voiceStore = useVoiceStore()
const copied = ref(false)

const isUser = computed(() => props.message.role === 'user')

async function copyContent() {
  await navigator.clipboard.writeText(props.message.content)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function speakMessage() {
  voiceStore.speak(props.message.content)
}
</script>

<template>
  <div
    :class="[
      'flex gap-3 animate-in',
      isUser ? 'flex-row-reverse' : '',
    ]"
  >
    <!-- Avatar -->
    <div
      :class="[
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
        isUser ? 'bg-cyan-500/20 text-cyan-300' : 'bg-jarvis-surface text-cyan-400 border border-cyan-400/30',
      ]"
    >
      <User v-if="isUser" class="w-4 h-4" />
      <Bot v-else class="w-4 h-4" />
    </div>

    <!-- Message content -->
    <div
      :class="[
        'flex-1 max-w-[80%] rounded-lg p-4',
        isUser
          ? 'bg-cyan-500/10 border border-cyan-400/30'
          : 'bg-muted/50 border border-border',
      ]"
    >
      <!-- Content -->
      <div v-if="isUser" class="text-jarvis-text-primary whitespace-pre-wrap">
        {{ message.content }}
      </div>
      <MarkdownRenderer v-else :content="message.content" />

      <!-- Streaming cursor -->
      <span
        v-if="isStreaming"
        class="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1"
      />

      <!-- Footer -->
      <div class="flex items-center justify-between mt-3 pt-2 border-t border-jarvis-border/50">
        <span class="text-xs text-jarvis-text-muted">
          {{ message.createdAt ? formatTime(message.createdAt) : '' }}
        </span>

        <div class="flex items-center gap-1">
          <!-- Token info -->
          <span v-if="message.tokens" class="text-xs text-jarvis-text-muted mr-2">
            {{ message.tokens.input + message.tokens.output }} tokens
          </span>

          <!-- Copy button -->
          <button
            class="p-1.5 text-jarvis-text-muted hover:text-cyan-300 rounded transition-colors"
            @click="copyContent"
            title="コピー"
          >
            <Check v-if="copied" class="w-3.5 h-3.5 text-green-400" />
            <Copy v-else class="w-3.5 h-3.5" />
          </button>

          <!-- Speak button (for assistant messages) -->
          <button
            v-if="!isUser && !isStreaming"
            class="p-1.5 text-jarvis-text-muted hover:text-cyan-300 rounded transition-colors"
            @click="speakMessage"
            title="読み上げ"
          >
            <Volume2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
