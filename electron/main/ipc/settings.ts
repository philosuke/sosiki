import { IpcMain } from 'electron'
import Store from 'electron-store'
import type { AppSettings } from '../../../src/types/settings'

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

const store = new Store<{ settings: AppSettings }>({
  name: 'claudis-settings',
  defaults: {
    settings: defaultSettings,
  },
})

export function setupSettingsHandlers(ipcMain: IpcMain) {
  ipcMain.handle('settings:get', () => {
    return store.get('settings', defaultSettings)
  })

  ipcMain.handle('settings:set', (_event, updates: Partial<AppSettings>) => {
    const current = store.get('settings', defaultSettings)
    const merged = deepMerge(current, updates)
    store.set('settings', merged)
    return merged
  })

  ipcMain.handle('settings:reset', () => {
    store.set('settings', defaultSettings)
    return defaultSettings
  })
}

function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        target[key] !== null
      ) {
        result[key] = deepMerge(target[key], source[key] as any)
      } else {
        result[key] = source[key] as T[typeof key]
      }
    }
  }

  return result
}
