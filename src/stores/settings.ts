import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppSettings } from '../types/settings'

const defaultSettings: AppSettings = {
  general: {
    language: 'ja',
    theme: 'dark',
    fontSize: 14,
    sendWithEnter: true,
  },
  api: {
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4096,
    temperature: 1,
  },
  voice: {
    input: {
      engine: 'web-speech',
      webSpeech: {
        language: 'ja-JP',
        continuous: true,
        interimResults: true,
      },
      wakeWord: {
        enabled: false,
        phrase: 'クラウディス',
        sensitivity: 0.5,
      },
      behavior: {
        autoSend: true,
        silenceTimeout: 2000,
        showWaveform: true,
      },
    },
    output: {
      engine: 'web-speech',
      webSpeech: {
        voice: '',
        rate: 1,
        pitch: 1,
        volume: 1,
      },
      behavior: {
        autoRead: false,
        highlightWhileReading: true,
        skipCodeBlocks: true,
      },
    },
  },
  window: {
    width: 1400,
    height: 900,
    maximized: false,
  },
  shortcuts: {
    sendMessage: 'Ctrl+Enter',
    newConversation: 'Ctrl+N',
    commandPalette: 'Ctrl+K',
    voiceInput: 'Ctrl+Shift+V',
    voiceOutput: 'Ctrl+Shift+R',
    settings: 'Ctrl+,',
  },
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>(defaultSettings)
  const isLoading = ref(false)
  const hasApiKey = ref(false)

  // Computed getters
  const model = computed(() => settings.value.api.model)
  const maxTokens = computed(() => settings.value.api.maxTokens)
  const temperature = computed(() => settings.value.api.temperature)
  const voiceInputConfig = computed(() => settings.value.voice.input)
  const voiceOutputConfig = computed(() => settings.value.voice.output)

  // Load settings from electron-store
  async function loadSettings() {
    isLoading.value = true
    try {
      const storedSettings = await window.electronAPI.settings.get()
      settings.value = { ...defaultSettings, ...storedSettings }

      // Check if API key exists
      const apiKey = await window.electronAPI.secure.getApiKey()
      hasApiKey.value = !!apiKey
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Save settings
  async function saveSettings(updates: Partial<AppSettings>) {
    try {
      await window.electronAPI.settings.set(updates)
      settings.value = { ...settings.value, ...updates }
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw error
    }
  }

  // Update specific setting
  async function updateSetting<K extends keyof AppSettings>(
    key: K,
    value: Partial<AppSettings[K]>
  ) {
    const update = {
      [key]: { ...settings.value[key], ...value },
    } as Partial<AppSettings>
    await saveSettings(update)
  }

  // Set API key
  async function setApiKey(key: string) {
    await window.electronAPI.secure.setApiKey(key)
    hasApiKey.value = true
  }

  // Delete API key
  async function deleteApiKey() {
    await window.electronAPI.secure.deleteApiKey()
    hasApiKey.value = false
  }

  // Reset settings
  async function resetSettings() {
    await window.electronAPI.settings.reset()
    settings.value = defaultSettings
  }

  return {
    settings,
    isLoading,
    hasApiKey,
    model,
    maxTokens,
    temperature,
    voiceInputConfig,
    voiceOutputConfig,
    loadSettings,
    saveSettings,
    updateSetting,
    setApiKey,
    deleteApiKey,
    resetSettings,
  }
})
