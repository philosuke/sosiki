<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import {
  X,
  Settings,
  Key,
  Mic,
  Volume2,
  Keyboard,
  Palette,
} from 'lucide-vue-next'
import GlowButton from '../jarvis/GlowButton.vue'
import GeneralSettings from './GeneralSettings.vue'
import ApiSettings from './ApiSettings.vue'
import VoiceSettings from './VoiceSettings.vue'
import { useSettingsStore } from '../../stores/settings'

const emit = defineEmits<{
  close: []
}>()

const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)

const activeTab = ref('general')

const tabs = [
  { id: 'general', label: '一般', icon: Settings },
  { id: 'api', label: 'API', icon: Key },
  { id: 'voice', label: '音声', icon: Mic },
]
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div class="w-full max-w-2xl bg-jarvis-surface border border-jarvis-border rounded-lg shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-jarvis-border">
        <h3 class="text-lg font-semibold text-cyan-300">設定</h3>
        <button
          class="p-2 text-jarvis-text-muted hover:text-jarvis-text-primary rounded-lg hover:bg-jarvis-surface-hover transition-colors"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="flex">
        <!-- Sidebar -->
        <div class="w-48 border-r border-jarvis-border p-2 space-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
              activeTab === tab.id
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-400/30'
                : 'text-jarvis-text-secondary hover:text-jarvis-text-primary hover:bg-jarvis-surface-hover',
            ]"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 p-4 max-h-[60vh] overflow-y-auto">
          <GeneralSettings v-if="activeTab === 'general'" />
          <ApiSettings v-else-if="activeTab === 'api'" />
          <VoiceSettings v-else-if="activeTab === 'voice'" />
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-4 border-t border-jarvis-border">
        <GlowButton variant="outline" @click="settingsStore.resetSettings()">
          リセット
        </GlowButton>
        <GlowButton @click="emit('close')">
          閉じる
        </GlowButton>
      </div>
    </div>
  </div>
</template>
