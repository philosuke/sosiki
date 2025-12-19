<script setup lang="ts">
import { computed } from 'vue'
import {
  Folder,
  Database,
  Globe,
  Code,
  Briefcase,
  Puzzle,
  MoreVertical,
  Edit,
  Trash2,
  RotateCcw,
  Zap,
} from 'lucide-vue-next'
import StatusIndicator from '../jarvis/StatusIndicator.vue'
import GlowCard from '../jarvis/GlowCard.vue'
import type { MCPServerConfig, MCPStatus } from '../../types/mcp'

const props = defineProps<{
  server: MCPServerConfig
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  toggle: []
  test: []
}>()

const categoryIcons = {
  filesystem: Folder,
  database: Database,
  api: Globe,
  development: Code,
  productivity: Briefcase,
  custom: Puzzle,
}

const statusToIndicator = (status?: MCPStatus) => {
  switch (status) {
    case 'connected': return 'online'
    case 'connecting': return 'loading'
    case 'error': return 'error'
    default: return 'offline'
  }
}

const IconComponent = computed(() => categoryIcons[props.server.category || 'custom'])
</script>

<template>
  <GlowCard class="p-4">
    <div class="flex items-start gap-4">
      <!-- Icon -->
      <div
        :class="[
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          server.enabled ? 'bg-cyan-500/20 text-cyan-300' : 'bg-jarvis-surface text-jarvis-text-muted',
        ]"
      >
        <component :is="IconComponent" class="w-5 h-5" />
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h4 class="font-medium text-jarvis-text-primary truncate">
            {{ server.name }}
          </h4>
          <StatusIndicator
            :status="statusToIndicator(server.status)"
            size="sm"
            :show-pulse="server.status === 'connecting'"
          />
        </div>
        <p class="text-sm text-jarvis-text-secondary truncate mt-0.5">
          {{ server.command }} {{ server.args.join(' ') }}
        </p>
        <p v-if="server.lastError" class="text-xs text-red-400 mt-1 truncate">
          {{ server.lastError }}
        </p>
      </div>

      <!-- Toggle -->
      <button
        :class="[
          'relative w-11 h-6 rounded-full transition-colors',
          server.enabled ? 'bg-cyan-500' : 'bg-jarvis-surface',
        ]"
        @click="emit('toggle')"
      >
        <span
          :class="[
            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
            server.enabled ? 'left-6' : 'left-1',
          ]"
        />
      </button>

      <!-- Actions -->
      <div class="relative group">
        <button class="p-2 text-jarvis-text-muted hover:text-cyan-300 rounded-lg hover:bg-jarvis-surface-hover transition-colors">
          <MoreVertical class="w-4 h-4" />
        </button>

        <!-- Dropdown -->
        <div class="absolute right-0 top-full mt-1 w-40 py-1 bg-jarvis-surface border border-jarvis-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
          <button
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-jarvis-text-secondary hover:text-cyan-300 hover:bg-jarvis-surface-hover"
            @click="emit('test')"
          >
            <Zap class="w-4 h-4" />
            接続テスト
          </button>
          <button
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-jarvis-text-secondary hover:text-cyan-300 hover:bg-jarvis-surface-hover"
            @click="emit('edit')"
          >
            <Edit class="w-4 h-4" />
            編集
          </button>
          <button
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
            @click="emit('delete')"
          >
            <Trash2 class="w-4 h-4" />
            削除
          </button>
        </div>
      </div>
    </div>
  </GlowCard>
</template>
