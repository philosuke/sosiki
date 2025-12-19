export type VoiceInputState = 'idle' | 'waiting' | 'recording' | 'processing' | 'error'

export type VoiceOutputState = 'idle' | 'speaking' | 'paused'

export interface VoiceRecognitionResult {
  transcript: string
  isFinal: boolean
  confidence: number
}

export interface AudioVisualizerData {
  frequencyData: Uint8Array
  waveformData: Uint8Array
  volume: number
}

export interface SpeechSynthesisConfig {
  text: string
  voice?: SpeechSynthesisVoice
  rate?: number
  pitch?: number
  volume?: number
  onStart?: () => void
  onEnd?: () => void
  onPause?: () => void
  onResume?: () => void
  onBoundary?: (event: SpeechSynthesisEvent) => void
  onError?: (error: SpeechSynthesisErrorEvent) => void
}
