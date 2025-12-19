<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '../../stores/settings'

const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)

async function updateGeneral(key: string, value: any) {
  await settingsStore.updateSetting('general', { [key]: value })
}
</script>

<template>
  <div class="space-y-6">
    <h4 class="text-sm font-medium text-cyan-300">一般設定</h4>

    <!-- Language -->
    <div class="space-y-2">
      <label class="block text-sm text-jarvis-text-secondary">言語</label>
      <select
        :value="settings.general.language"
        class="w-full px-3 py-2 bg-jarvis-background border border-jarvis-border rounded-lg text-jarvis-text-primary focus:border-cyan-400/50 focus:outline-none"
        @change="updateGeneral('language', ($event.target as HTMLSelectElement).value)"
      >
        <option value="ja">日本語</option>
        <option value="en">English</option>
      </select>
    </div>

    <!-- Font Size -->
    <div class="space-y-2">
      <label class="block text-sm text-jarvis-text-secondary">
        フォントサイズ: {{ settings.general.fontSize }}px
      </label>
      <input
        type="range"
        :value="settings.general.fontSize"
        min="12"
        max="20"
        class="w-full accent-cyan-400"
        @input="updateGeneral('fontSize', Number(($event.target as HTMLInputElement).value))"
      />
      <div class="flex justify-between text-xs text-jarvis-text-muted">
        <span>12px</span>
        <span>20px</span>
      </div>
    </div>

    <!-- Send with Enter -->
    <div class="flex items-center justify-between">
      <div>
        <label class="block text-sm text-jarvis-text-primary">Enterで送信</label>
        <p class="text-xs text-jarvis-text-muted">
          オフにするとCtrl+Enterで送信になります
        </p>
      </div>
      <button
        :class="[
          'relative w-11 h-6 rounded-full transition-colors',
          settings.general.sendWithEnter ? 'bg-cyan-500' : 'bg-jarvis-surface',
        ]"
        @click="updateGeneral('sendWithEnter', !settings.general.sendWithEnter)"
      >
        <span
          :class="[
            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
            settings.general.sendWithEnter ? 'left-6' : 'left-1',
          ]"
        />
      </button>
    </div>
  </div>
</template>
