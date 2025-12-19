<script setup lang="ts">
import { ref, computed } from 'vue'
import { Send, Mic, MicOff, Paperclip, Square } from 'lucide-vue-next'
import GlowButton from '../jarvis/GlowButton.vue'
import { useVoiceStore } from '../../stores/voice'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  disabled?: boolean
  isLoading?: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
  cancel: []
}>()

const voiceStore = useVoiceStore()
const { isRecording, transcript, interimTranscript } = storeToRefs(voiceStore)

const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const displayText = computed(() => {
  if (isRecording.value) {
    return transcript.value + interimTranscript.value
  }
  return inputText.value
})

const canSend = computed(() => {
  return displayText.value.trim().length > 0 && !props.disabled
})

function handleSend() {
  if (!canSend.value) return

  const content = displayText.value.trim()
  if (isRecording.value) {
    voiceStore.stopRecording()
    emit('send', voiceStore.getTranscriptAndClear())
  } else {
    emit('send', content)
    inputText.value = ''
  }

  // Reset textarea height
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function handleInput() {
  // Auto-resize textarea
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 200)}px`
  }
}

async function toggleRecording() {
  if (isRecording.value) {
    voiceStore.stopRecording()
  } else {
    await voiceStore.startRecording()
  }
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="space-y-2">
    <!-- Input area -->
    <div
      :class="[
        'flex items-end gap-2 p-3 rounded-lg border transition-all',
        'bg-jarvis-surface/50 border-jarvis-border',
        'focus-within:border-cyan-400/50 focus-within:shadow-glow-sm',
      ]"
    >
      <!-- Attachment button -->
      <button
        class="p-2 text-jarvis-text-muted hover:text-cyan-300 rounded-lg hover:bg-jarvis-surface-hover transition-colors"
        title="ファイルを添付"
        :disabled="disabled"
      >
        <Paperclip class="w-5 h-5" />
      </button>

      <!-- Text input -->
      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          :placeholder="isRecording ? '音声入力中...' : 'メッセージを入力...'"
          :disabled="disabled || isRecording"
          rows="1"
          class="w-full bg-transparent text-jarvis-text-primary placeholder-jarvis-text-muted resize-none focus:outline-none"
          style="min-height: 24px; max-height: 200px"
          @keydown="handleKeydown"
          @input="handleInput"
        />
        <!-- Display voice transcript -->
        <div
          v-if="isRecording && (transcript || interimTranscript)"
          class="absolute inset-0 pointer-events-none text-jarvis-text-primary"
        >
          {{ transcript }}<span class="text-cyan-400/70">{{ interimTranscript }}</span>
        </div>
      </div>

      <!-- Voice button -->
      <button
        :class="[
          'p-2 rounded-lg transition-all',
          isRecording
            ? 'bg-red-500/20 text-red-400 animate-pulse'
            : 'text-jarvis-text-muted hover:text-cyan-300 hover:bg-jarvis-surface-hover',
        ]"
        :disabled="disabled"
        @click="toggleRecording"
        :title="isRecording ? '録音停止' : '音声入力'"
      >
        <MicOff v-if="isRecording" class="w-5 h-5" />
        <Mic v-else class="w-5 h-5" />
      </button>

      <!-- Send/Cancel button -->
      <GlowButton
        v-if="isLoading"
        size="icon"
        variant="accent"
        @click="handleCancel"
        title="キャンセル"
      >
        <Square class="w-4 h-4" />
      </GlowButton>
      <GlowButton
        v-else
        size="icon"
        :disabled="!canSend"
        @click="handleSend"
        title="送信"
      >
        <Send class="w-4 h-4" />
      </GlowButton>
    </div>

    <!-- Hint text -->
    <div class="flex items-center justify-between text-xs text-jarvis-text-muted px-1">
      <span>Shift + Enter で改行</span>
      <span>Ctrl + Shift + V で音声入力</span>
    </div>
  </div>
</template>
