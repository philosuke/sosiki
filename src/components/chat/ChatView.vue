<script setup lang="ts">
import { storeToRefs } from 'pinia'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'
import HolographicOrb from '../jarvis/HolographicOrb.vue'
import VoiceWaveform from '../jarvis/VoiceWaveform.vue'
import { useChatStore } from '../../stores/chat'
import { useVoiceStore } from '../../stores/voice'
import { useSettingsStore } from '../../stores/settings'

const chatStore = useChatStore()
const voiceStore = useVoiceStore()
const settingsStore = useSettingsStore()

const { messages, isLoading, isStreaming, error } = storeToRefs(chatStore)
const { isRecording, audioData } = storeToRefs(voiceStore)
const { hasApiKey } = storeToRefs(settingsStore)

function handleSend(content: string) {
  if (!content.trim()) return
  chatStore.sendMessage(content)
}

function handleCancel() {
  chatStore.cancelStream()
}
</script>

<template>
  <div class="flex-1 flex flex-col relative">
    <!-- API Key Warning -->
    <div
      v-if="!hasApiKey"
      class="absolute top-0 left-0 right-0 bg-orange-500/10 border-b border-orange-400/30 px-4 py-2 text-center text-orange-300 text-sm z-10"
    >
      APIキーが設定されていません。設定からClaude APIキーを設定してください。
    </div>

    <!-- Message List -->
    <MessageList
      :messages="messages"
      :is-loading="isLoading"
      :is-streaming="isStreaming"
      class="flex-1 overflow-y-auto"
      :class="{ 'pt-10': !hasApiKey }"
    />

    <!-- Error Display -->
    <div
      v-if="error"
      class="px-4 py-2 bg-red-500/10 border-t border-red-400/30 text-red-300 text-sm"
    >
      {{ error }}
    </div>

    <!-- Bottom Section -->
    <div class="border-t border-jarvis-border bg-jarvis-surface/50 p-4 space-y-3">
      <!-- Voice Waveform (when recording) -->
      <div v-if="isRecording" class="flex justify-center">
        <VoiceWaveform :is-active="true" :audio-data="audioData?.frequencyData" />
      </div>

      <!-- Message Input -->
      <MessageInput
        :disabled="!hasApiKey"
        :is-loading="isLoading"
        @send="handleSend"
        @cancel="handleCancel"
      />
    </div>

    <!-- Floating Orb Indicator -->
    <div class="absolute bottom-32 right-8">
      <HolographicOrb
        :size="64"
        :is-thinking="isLoading || isStreaming"
        :is-active="hasApiKey"
      />
    </div>
  </div>
</template>
