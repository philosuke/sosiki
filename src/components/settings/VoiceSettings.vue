<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '../../stores/settings'
import { useVoiceStore } from '../../stores/voice'
import { VOICE_LANGUAGES } from '../../lib/constants'

const settingsStore = useSettingsStore()
const voiceStore = useVoiceStore()
const { settings } = storeToRefs(settingsStore)

const availableVoices = ref<SpeechSynthesisVoice[]>([])

onMounted(() => {
  // Get available voices
  availableVoices.value = voiceStore.getVoices()
  // Voices might load async
  speechSynthesis.onvoiceschanged = () => {
    availableVoices.value = voiceStore.getVoices()
  }
})

async function updateInputConfig(key: string, value: any) {
  await settingsStore.updateSetting('voice', {
    input: {
      ...settings.value.voice.input,
      [key]: value,
    },
  })
}

async function updateInputBehavior(key: string, value: any) {
  await settingsStore.updateSetting('voice', {
    input: {
      ...settings.value.voice.input,
      behavior: {
        ...settings.value.voice.input.behavior,
        [key]: value,
      },
    },
  })
}

async function updateOutputConfig(key: string, value: any) {
  await settingsStore.updateSetting('voice', {
    output: {
      ...settings.value.voice.output,
      webSpeech: {
        ...settings.value.voice.output.webSpeech,
        [key]: value,
      },
    },
  })
}

async function updateOutputBehavior(key: string, value: any) {
  await settingsStore.updateSetting('voice', {
    output: {
      ...settings.value.voice.output,
      behavior: {
        ...settings.value.voice.output.behavior,
        [key]: value,
      },
    },
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Voice Input -->
    <div class="space-y-4">
      <h4 class="text-sm font-medium text-cyan-300">音声入力</h4>

      <!-- Language -->
      <div class="space-y-2">
        <label class="block text-sm text-jarvis-text-secondary">認識言語</label>
        <select
          :value="settings.voice.input.webSpeech.language"
          class="w-full px-3 py-2 bg-jarvis-background border border-jarvis-border rounded-lg text-jarvis-text-primary focus:border-cyan-400/50 focus:outline-none"
          @change="updateInputConfig('webSpeech', { ...settings.voice.input.webSpeech, language: ($event.target as HTMLSelectElement).value })"
        >
          <option v-for="lang in VOICE_LANGUAGES" :key="lang.code" :value="lang.code">
            {{ lang.name }}
          </option>
        </select>
      </div>

      <!-- Auto Send -->
      <div class="flex items-center justify-between">
        <div>
          <label class="block text-sm text-jarvis-text-primary">自動送信</label>
          <p class="text-xs text-jarvis-text-muted">
            無音を検出したら自動的に送信
          </p>
        </div>
        <button
          :class="[
            'relative w-11 h-6 rounded-full transition-colors',
            settings.voice.input.behavior.autoSend ? 'bg-cyan-500' : 'bg-jarvis-surface',
          ]"
          @click="updateInputBehavior('autoSend', !settings.voice.input.behavior.autoSend)"
        >
          <span
            :class="[
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              settings.voice.input.behavior.autoSend ? 'left-6' : 'left-1',
            ]"
          />
        </button>
      </div>

      <!-- Show Waveform -->
      <div class="flex items-center justify-between">
        <div>
          <label class="block text-sm text-jarvis-text-primary">波形表示</label>
          <p class="text-xs text-jarvis-text-muted">
            録音中に音声波形を表示
          </p>
        </div>
        <button
          :class="[
            'relative w-11 h-6 rounded-full transition-colors',
            settings.voice.input.behavior.showWaveform ? 'bg-cyan-500' : 'bg-jarvis-surface',
          ]"
          @click="updateInputBehavior('showWaveform', !settings.voice.input.behavior.showWaveform)"
        >
          <span
            :class="[
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              settings.voice.input.behavior.showWaveform ? 'left-6' : 'left-1',
            ]"
          />
        </button>
      </div>
    </div>

    <hr class="border-jarvis-border" />

    <!-- Voice Output -->
    <div class="space-y-4">
      <h4 class="text-sm font-medium text-cyan-300">音声出力</h4>

      <!-- Voice -->
      <div class="space-y-2">
        <label class="block text-sm text-jarvis-text-secondary">音声</label>
        <select
          :value="settings.voice.output.webSpeech.voice"
          class="w-full px-3 py-2 bg-jarvis-background border border-jarvis-border rounded-lg text-jarvis-text-primary focus:border-cyan-400/50 focus:outline-none"
          @change="updateOutputConfig('voice', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">デフォルト</option>
          <option v-for="voice in availableVoices" :key="voice.name" :value="voice.name">
            {{ voice.name }} ({{ voice.lang }})
          </option>
        </select>
      </div>

      <!-- Rate -->
      <div class="space-y-2">
        <label class="block text-sm text-jarvis-text-secondary">
          速度: {{ settings.voice.output.webSpeech.rate.toFixed(1) }}x
        </label>
        <input
          type="range"
          :value="settings.voice.output.webSpeech.rate"
          min="0.5"
          max="2"
          step="0.1"
          class="w-full accent-cyan-400"
          @input="updateOutputConfig('rate', Number(($event.target as HTMLInputElement).value))"
        />
        <div class="flex justify-between text-xs text-jarvis-text-muted">
          <span>0.5x</span>
          <span>2x</span>
        </div>
      </div>

      <!-- Pitch -->
      <div class="space-y-2">
        <label class="block text-sm text-jarvis-text-secondary">
          ピッチ: {{ settings.voice.output.webSpeech.pitch.toFixed(1) }}
        </label>
        <input
          type="range"
          :value="settings.voice.output.webSpeech.pitch"
          min="0.5"
          max="2"
          step="0.1"
          class="w-full accent-cyan-400"
          @input="updateOutputConfig('pitch', Number(($event.target as HTMLInputElement).value))"
        />
        <div class="flex justify-between text-xs text-jarvis-text-muted">
          <span>低い</span>
          <span>高い</span>
        </div>
      </div>

      <!-- Auto Read -->
      <div class="flex items-center justify-between">
        <div>
          <label class="block text-sm text-jarvis-text-primary">自動読み上げ</label>
          <p class="text-xs text-jarvis-text-muted">
            応答を自動的に読み上げ
          </p>
        </div>
        <button
          :class="[
            'relative w-11 h-6 rounded-full transition-colors',
            settings.voice.output.behavior.autoRead ? 'bg-cyan-500' : 'bg-jarvis-surface',
          ]"
          @click="updateOutputBehavior('autoRead', !settings.voice.output.behavior.autoRead)"
        >
          <span
            :class="[
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              settings.voice.output.behavior.autoRead ? 'left-6' : 'left-1',
            ]"
          />
        </button>
      </div>

      <!-- Skip Code Blocks -->
      <div class="flex items-center justify-between">
        <div>
          <label class="block text-sm text-jarvis-text-primary">コードブロックをスキップ</label>
          <p class="text-xs text-jarvis-text-muted">
            読み上げ時にコードをスキップ
          </p>
        </div>
        <button
          :class="[
            'relative w-11 h-6 rounded-full transition-colors',
            settings.voice.output.behavior.skipCodeBlocks ? 'bg-cyan-500' : 'bg-jarvis-surface',
          ]"
          @click="updateOutputBehavior('skipCodeBlocks', !settings.voice.output.behavior.skipCodeBlocks)"
        >
          <span
            :class="[
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              settings.voice.output.behavior.skipCodeBlocks ? 'left-6' : 'left-1',
            ]"
          />
        </button>
      </div>
    </div>
  </div>
</template>
