<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-vue-next'
import GlowButton from '../jarvis/GlowButton.vue'
import { useSettingsStore } from '../../stores/settings'
import { CLAUDE_MODELS } from '../../lib/constants'

const settingsStore = useSettingsStore()
const { settings, hasApiKey } = storeToRefs(settingsStore)

const apiKey = ref('')
const showApiKey = ref(false)
const isTestingConnection = ref(false)
const connectionStatus = ref<'idle' | 'success' | 'error'>('idle')

onMounted(async () => {
  if (hasApiKey.value) {
    apiKey.value = '••••••••••••••••••••••••••••'
  }
})

async function saveApiKey() {
  if (apiKey.value && !apiKey.value.includes('•')) {
    await settingsStore.setApiKey(apiKey.value)
    apiKey.value = '••••••••••••••••••••••••••••'
  }
}

async function deleteApiKey() {
  if (confirm('APIキーを削除しますか？')) {
    await settingsStore.deleteApiKey()
    apiKey.value = ''
  }
}

async function updateApi(key: string, value: any) {
  await settingsStore.updateSetting('api', { [key]: value })
}

async function testConnection() {
  isTestingConnection.value = true
  connectionStatus.value = 'idle'

  try {
    // Simple test - just check if we can make a request
    const response = await window.electronAPI.claude.sendMessage(
      [{ role: 'user', content: 'test' }],
      { maxTokens: 10 }
    )
    connectionStatus.value = response ? 'success' : 'error'
  } catch {
    connectionStatus.value = 'error'
  } finally {
    isTestingConnection.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <h4 class="text-sm font-medium text-cyan-300">API設定</h4>

    <!-- API Key -->
    <div class="space-y-2">
      <label class="block text-sm text-jarvis-text-secondary">
        Claude APIキー
        <span v-if="hasApiKey" class="text-green-400 ml-2">
          <Check class="w-4 h-4 inline" /> 設定済み
        </span>
      </label>
      <div class="flex gap-2">
        <div class="flex-1 relative">
          <input
            v-model="apiKey"
            :type="showApiKey ? 'text' : 'password'"
            placeholder="sk-ant-api03-..."
            class="w-full px-3 py-2 pr-10 bg-jarvis-background border border-jarvis-border rounded-lg text-jarvis-text-primary placeholder-jarvis-text-muted focus:border-cyan-400/50 focus:outline-none font-mono text-sm"
          />
          <button
            class="absolute right-2 top-1/2 -translate-y-1/2 text-jarvis-text-muted hover:text-jarvis-text-primary"
            @click="showApiKey = !showApiKey"
          >
            <EyeOff v-if="showApiKey" class="w-4 h-4" />
            <Eye v-else class="w-4 h-4" />
          </button>
        </div>
        <GlowButton @click="saveApiKey">保存</GlowButton>
      </div>
      <p class="text-xs text-jarvis-text-muted">
        APIキーは安全にOSのキーチェーンに保存されます
      </p>
    </div>

    <!-- Test Connection -->
    <div v-if="hasApiKey" class="flex items-center gap-3">
      <GlowButton
        variant="outline"
        :loading="isTestingConnection"
        @click="testConnection"
      >
        接続テスト
      </GlowButton>
      <span v-if="connectionStatus === 'success'" class="text-green-400 flex items-center gap-1">
        <Check class="w-4 h-4" /> 接続成功
      </span>
      <span v-else-if="connectionStatus === 'error'" class="text-red-400 flex items-center gap-1">
        <AlertCircle class="w-4 h-4" /> 接続失敗
      </span>
    </div>

    <!-- Delete Key -->
    <div v-if="hasApiKey">
      <button
        class="text-sm text-red-400 hover:text-red-300"
        @click="deleteApiKey"
      >
        APIキーを削除
      </button>
    </div>

    <hr class="border-jarvis-border" />

    <!-- Model -->
    <div class="space-y-2">
      <label class="block text-sm text-jarvis-text-secondary">モデル</label>
      <select
        :value="settings.api.model"
        class="w-full px-3 py-2 bg-jarvis-background border border-jarvis-border rounded-lg text-jarvis-text-primary focus:border-cyan-400/50 focus:outline-none"
        @change="updateApi('model', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="model in CLAUDE_MODELS" :key="model.id" :value="model.id">
          {{ model.name }}
        </option>
      </select>
    </div>

    <!-- Max Tokens -->
    <div class="space-y-2">
      <label class="block text-sm text-jarvis-text-secondary">
        最大トークン数: {{ settings.api.maxTokens.toLocaleString() }}
      </label>
      <input
        type="range"
        :value="settings.api.maxTokens"
        min="1024"
        max="8192"
        step="1024"
        class="w-full accent-cyan-400"
        @input="updateApi('maxTokens', Number(($event.target as HTMLInputElement).value))"
      />
      <div class="flex justify-between text-xs text-jarvis-text-muted">
        <span>1,024</span>
        <span>8,192</span>
      </div>
    </div>

    <!-- Temperature -->
    <div class="space-y-2">
      <label class="block text-sm text-jarvis-text-secondary">
        Temperature: {{ settings.api.temperature.toFixed(1) }}
      </label>
      <input
        type="range"
        :value="settings.api.temperature"
        min="0"
        max="1"
        step="0.1"
        class="w-full accent-cyan-400"
        @input="updateApi('temperature', Number(($event.target as HTMLInputElement).value))"
      />
      <div class="flex justify-between text-xs text-jarvis-text-muted">
        <span>0 (決定的)</span>
        <span>1 (創造的)</span>
      </div>
    </div>
  </div>
</template>
