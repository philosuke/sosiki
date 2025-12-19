export interface AppSettings {
  general: GeneralSettings
  api: ApiSettings
  voice: VoiceSettings
  window: WindowSettings
  shortcuts: Record<string, string>
}

export interface GeneralSettings {
  language: 'ja' | 'en'
  theme: 'dark' | 'light' | 'system'
  fontSize: number
  sendWithEnter: boolean
}

export interface ApiSettings {
  model: string
  maxTokens: number
  temperature: number
  baseUrl?: string
}

export interface VoiceSettings {
  input: VoiceInputConfig
  output: VoiceOutputConfig
}

export interface VoiceInputConfig {
  engine: 'web-speech' | 'whisper-api' | 'whisper-local'
  webSpeech: {
    language: string
    continuous: boolean
    interimResults: boolean
  }
  whisperApi?: {
    model: string
    language?: string
    temperature?: number
  }
  wakeWord: {
    enabled: boolean
    phrase: string
    sensitivity: number
  }
  behavior: {
    autoSend: boolean
    silenceTimeout: number
    showWaveform: boolean
  }
}

export interface VoiceOutputConfig {
  engine: 'web-speech' | 'elevenlabs' | 'openai-tts'
  webSpeech: {
    voice: string
    rate: number
    pitch: number
    volume: number
  }
  elevenLabs?: {
    apiKey: string
    voiceId: string
    modelId: string
    stability: number
    similarityBoost: number
  }
  openaiTts?: {
    model: 'tts-1' | 'tts-1-hd'
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
    speed: number
  }
  behavior: {
    autoRead: boolean
    highlightWhileReading: boolean
    skipCodeBlocks: boolean
  }
}

export interface WindowSettings {
  width: number
  height: number
  x?: number
  y?: number
  maximized: boolean
}
