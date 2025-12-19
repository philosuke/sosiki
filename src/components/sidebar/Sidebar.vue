<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import {
  MessageSquarePlus,
  ChevronLeft,
  ChevronRight,
  Settings,
  Folder,
  Plug,
  BarChart3,
} from 'lucide-vue-next'
import StatusPanel from './StatusPanel.vue'
import ConversationList from './ConversationList.vue'
import GlowButton from '../jarvis/GlowButton.vue'
import { useChatStore } from '../../stores/chat'
import { useSettingsStore } from '../../stores/settings'
import { useMCPStore } from '../../stores/mcp'

const props = defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const chatStore = useChatStore()
const settingsStore = useSettingsStore()
const mcpStore = useMCPStore()

const { hasApiKey } = storeToRefs(settingsStore)
const { connectedCount } = storeToRefs(mcpStore)

const sidebarWidth = computed(() => props.collapsed ? 'w-16' : 'w-64')

function handleNewChat() {
  chatStore.createConversation()
}
</script>

<template>
  <aside
    :class="[
      sidebarWidth,
      'flex flex-col border-r border-jarvis-border bg-jarvis-surface/30 transition-all duration-300',
    ]"
  >
    <!-- Header -->
    <div class="p-3 border-b border-jarvis-border">
      <GlowButton
        v-if="!collapsed"
        class="w-full justify-start"
        @click="handleNewChat"
      >
        <MessageSquarePlus class="w-4 h-4" />
        <span>新規チャット</span>
      </GlowButton>
      <GlowButton
        v-else
        size="icon"
        @click="handleNewChat"
        title="新規チャット"
      >
        <MessageSquarePlus class="w-4 h-4" />
      </GlowButton>
    </div>

    <!-- Status Panel -->
    <StatusPanel
      v-if="!collapsed"
      :has-api-key="hasApiKey"
      :mcp-count="connectedCount"
    />

    <!-- Conversation List -->
    <ConversationList :collapsed="collapsed" class="flex-1 overflow-y-auto" />

    <!-- Quick Actions -->
    <div class="p-3 border-t border-jarvis-border space-y-2">
      <template v-if="!collapsed">
        <button
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-jarvis-text-secondary hover:text-cyan-300 hover:bg-jarvis-surface-hover rounded-lg transition-colors"
        >
          <Folder class="w-4 h-4" />
          <span>プロジェクト</span>
        </button>
        <button
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-jarvis-text-secondary hover:text-cyan-300 hover:bg-jarvis-surface-hover rounded-lg transition-colors"
        >
          <Plug class="w-4 h-4" />
          <span>MCP設定</span>
        </button>
        <button
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-jarvis-text-secondary hover:text-cyan-300 hover:bg-jarvis-surface-hover rounded-lg transition-colors"
        >
          <BarChart3 class="w-4 h-4" />
          <span>統計</span>
        </button>
        <button
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-jarvis-text-secondary hover:text-cyan-300 hover:bg-jarvis-surface-hover rounded-lg transition-colors"
        >
          <Settings class="w-4 h-4" />
          <span>設定</span>
        </button>
      </template>
      <template v-else>
        <button
          class="w-full flex justify-center p-2 text-jarvis-text-secondary hover:text-cyan-300 hover:bg-jarvis-surface-hover rounded-lg transition-colors"
          title="プロジェクト"
        >
          <Folder class="w-4 h-4" />
        </button>
        <button
          class="w-full flex justify-center p-2 text-jarvis-text-secondary hover:text-cyan-300 hover:bg-jarvis-surface-hover rounded-lg transition-colors"
          title="MCP設定"
        >
          <Plug class="w-4 h-4" />
        </button>
        <button
          class="w-full flex justify-center p-2 text-jarvis-text-secondary hover:text-cyan-300 hover:bg-jarvis-surface-hover rounded-lg transition-colors"
          title="設定"
        >
          <Settings class="w-4 h-4" />
        </button>
      </template>
    </div>

    <!-- Collapse toggle -->
    <button
      class="p-3 border-t border-jarvis-border flex justify-center text-jarvis-text-secondary hover:text-cyan-300 transition-colors"
      @click="emit('toggle')"
    >
      <component :is="collapsed ? ChevronRight : ChevronLeft" class="w-4 h-4" />
    </button>
  </aside>
</template>
