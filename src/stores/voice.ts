import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { VoiceInputState, VoiceOutputState, AudioVisualizerData } from '../types/voice'
import { useSettingsStore } from './settings'

export const useVoiceStore = defineStore('voice', () => {
  // Input state
  const inputState = ref<VoiceInputState>('idle')
  const transcript = ref('')
  const interimTranscript = ref('')
  const audioData = ref<AudioVisualizerData | null>(null)

  // Output state
  const outputState = ref<VoiceOutputState>('idle')
  const currentSpeakingText = ref('')
  const speakingProgress = ref(0)

  // Recognition instance
  let recognition: SpeechRecognition | null = null
  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let mediaStream: MediaStream | null = null

  // Computed
  const isRecording = computed(() => inputState.value === 'recording')
  const isSpeaking = computed(() => outputState.value === 'speaking')

  // Start voice recognition
  async function startRecording() {
    const settingsStore = useSettingsStore()
    const config = settingsStore.voiceInputConfig

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported')
      inputState.value = 'error'
      return
    }

    try {
      // Setup audio visualization
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContext = new AudioContext()
      analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(mediaStream)
      source.connect(analyser)
      analyser.fftSize = 256

      // Start visualization loop
      updateAudioData()

      // Setup speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition = new SpeechRecognition()

      recognition.continuous = config.webSpeech.continuous
      recognition.interimResults = config.webSpeech.interimResults
      recognition.lang = config.webSpeech.language

      recognition.onstart = () => {
        inputState.value = 'recording'
        transcript.value = ''
        interimTranscript.value = ''
      }

      recognition.onresult = (event) => {
        let final = ''
        let interim = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            final += result[0].transcript
          } else {
            interim += result[0].transcript
          }
        }

        if (final) {
          transcript.value += final
        }
        interimTranscript.value = interim
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        inputState.value = 'error'
        stopRecording()
      }

      recognition.onend = () => {
        if (inputState.value === 'recording') {
          inputState.value = 'idle'
        }
      }

      recognition.start()
      inputState.value = 'waiting'

    } catch (error) {
      console.error('Failed to start recording:', error)
      inputState.value = 'error'
    }
  }

  // Stop voice recognition
  function stopRecording() {
    if (recognition) {
      recognition.stop()
      recognition = null
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      mediaStream = null
    }

    if (audioContext) {
      audioContext.close()
      audioContext = null
      analyser = null
    }

    inputState.value = 'idle'
    audioData.value = null
  }

  // Update audio visualization data
  function updateAudioData() {
    if (!analyser || inputState.value !== 'recording') return

    const frequencyData = new Uint8Array(analyser.frequencyBinCount)
    const waveformData = new Uint8Array(analyser.frequencyBinCount)

    analyser.getByteFrequencyData(frequencyData)
    analyser.getByteTimeDomainData(waveformData)

    // Calculate volume
    let sum = 0
    for (let i = 0; i < frequencyData.length; i++) {
      sum += frequencyData[i]
    }
    const volume = sum / frequencyData.length / 255

    audioData.value = { frequencyData, waveformData, volume }

    requestAnimationFrame(updateAudioData)
  }

  // Get final transcript and clear
  function getTranscriptAndClear(): string {
    const result = transcript.value + interimTranscript.value
    transcript.value = ''
    interimTranscript.value = ''
    return result
  }

  // Speak text
  async function speak(text: string) {
    const settingsStore = useSettingsStore()
    const config = settingsStore.voiceOutputConfig

    return new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)

      utterance.rate = config.webSpeech.rate
      utterance.pitch = config.webSpeech.pitch
      utterance.volume = config.webSpeech.volume

      // Find voice
      if (config.webSpeech.voice) {
        const voices = speechSynthesis.getVoices()
        const voice = voices.find(v => v.name === config.webSpeech.voice)
        if (voice) {
          utterance.voice = voice
        }
      }

      utterance.onstart = () => {
        outputState.value = 'speaking'
        currentSpeakingText.value = text
        speakingProgress.value = 0
      }

      utterance.onboundary = (event) => {
        speakingProgress.value = event.charIndex / text.length
      }

      utterance.onend = () => {
        outputState.value = 'idle'
        currentSpeakingText.value = ''
        speakingProgress.value = 0
        resolve()
      }

      utterance.onerror = (event) => {
        outputState.value = 'idle'
        reject(new Error(event.error))
      }

      speechSynthesis.speak(utterance)
    })
  }

  // Stop speaking
  function stopSpeaking() {
    speechSynthesis.cancel()
    outputState.value = 'idle'
    currentSpeakingText.value = ''
    speakingProgress.value = 0
  }

  // Pause speaking
  function pauseSpeaking() {
    speechSynthesis.pause()
    outputState.value = 'paused'
  }

  // Resume speaking
  function resumeSpeaking() {
    speechSynthesis.resume()
    outputState.value = 'speaking'
  }

  // Get available voices
  function getVoices(): SpeechSynthesisVoice[] {
    return speechSynthesis.getVoices()
  }

  return {
    // State
    inputState,
    transcript,
    interimTranscript,
    audioData,
    outputState,
    currentSpeakingText,
    speakingProgress,

    // Computed
    isRecording,
    isSpeaking,

    // Input actions
    startRecording,
    stopRecording,
    getTranscriptAndClear,

    // Output actions
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    getVoices,
  }
})

// Extend window for speech recognition types
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
