<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { MessageSquare, Trash2 } from 'lucide-vue-next'
import { useChatStore } from '../../stores/chat'
import { formatDate, truncate } from '../../lib/utils'

defineProps<{
  collapsed: boolean
}>()

const chatStore = useChatStore()
const { conversations, currentConversationId } = storeToRefs(chatStore)

function selectConversation(id: string) {
  chatStore.selectConversation(id)
}

function deleteConversation(id: string, event: Event) {
  event.stopPropagation()
  if (confirm('この会話を削除しますか？')) {
    chatStore.deleteConversation(id)
  }
}
</script>

<template>
  <div class="p-2 space-y-1">
    <template v-if="!collapsed">
      <div class="text-xs font-medium text-jarvis-text-muted uppercase tracking-wider px-2 py-1">
        CONVERSATIONS
      </div>

      <div v-if="conversations.length === 0" class="px-2 py-4 text-center text-jarvis-text-muted text-sm">
        会話がありません
      </div>

      <button
        v-for="conv in conversations"
        :key="conv.id"
        :class="[
          'w-full text-left px-3 py-2 rounded-lg transition-all duration-200 group',
          'hover:bg-jarvis-surface-hover',
          currentConversationId === conv.id
            ? 'bg-cyan-500/10 border border-cyan-400/30 text-cyan-300'
            : 'text-jarvis-text-secondary hover:text-jarvis-text-primary',
        ]"
        @click="selectConversation(conv.id)"
      >
        <div class="flex items-start gap-2">
          <MessageSquare class="w-4 h-4 mt-0.5 shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">
              {{ truncate(conv.title, 24) }}
            </div>
            <div class="text-xs text-jarvis-text-muted">
              {{ formatDate(conv.updatedAt) }}
            </div>
          </div>
          <button
            class="p-1 opacity-0 group-hover:opacity-100 text-jarvis-text-muted hover:text-red-400 transition-all"
            @click="deleteConversation(conv.id, $event)"
            title="削除"
          >
            <Trash2 class="w-3 h-3" />
          </button>
        </div>
      </button>
    </template>

    <template v-else>
      <button
        v-for="conv in conversations.slice(0, 5)"
        :key="conv.id"
        :class="[
          'w-full flex justify-center p-2 rounded-lg transition-colors',
          currentConversationId === conv.id
            ? 'bg-cyan-500/10 text-cyan-300'
            : 'text-jarvis-text-secondary hover:text-cyan-300 hover:bg-jarvis-surface-hover',
        ]"
        :title="conv.title"
        @click="selectConversation(conv.id)"
      >
        <MessageSquare class="w-4 h-4" />
      </button>
    </template>
  </div>
</template>
