<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Plus, RefreshCw, Search } from 'lucide-vue-next'
import MCPServerCard from './MCPServerCard.vue'
import MCPServerDialog from './MCPServerDialog.vue'
import MCPTemplateGallery from './MCPTemplateGallery.vue'
import GlowButton from '../jarvis/GlowButton.vue'
import { useMCPStore } from '../../stores/mcp'
import type { MCPServerConfig } from '../../types/mcp'

const mcpStore = useMCPStore()
const { servers, serversByCategory, isLoading, error } = storeToRefs(mcpStore)

const showServerDialog = ref(false)
const showTemplateGallery = ref(false)
const editingServer = ref<MCPServerConfig | null>(null)
const searchQuery = ref('')

onMounted(() => {
  mcpStore.loadServers()
  mcpStore.setupStatusListener()
})

function handleAddServer() {
  editingServer.value = null
  showServerDialog.value = true
}

function handleEditServer(server: MCPServerConfig) {
  editingServer.value = server
  showServerDialog.value = true
}

function handleAddFromTemplate(template: Omit<MCPServerConfig, 'id'>) {
  editingServer.value = { ...template, id: '' } as MCPServerConfig
  showTemplateGallery.value = false
  showServerDialog.value = true
}

async function handleSaveServer(config: MCPServerConfig) {
  if (editingServer.value?.id) {
    await mcpStore.updateServer(editingServer.value.id, config)
  } else {
    await mcpStore.addServer(config)
  }
  showServerDialog.value = false
  editingServer.value = null
}

async function handleDeleteServer(id: string) {
  if (confirm('このMCPサーバーを削除しますか？')) {
    await mcpStore.removeServer(id)
  }
}

async function handleToggleServer(id: string) {
  await mcpStore.toggleServer(id)
}

async function handleTestConnection(id: string) {
  const result = await mcpStore.testConnection(id)
  if (!result.success) {
    alert(`接続テスト失敗: ${result.error}`)
  }
}

const categoryLabels: Record<string, string> = {
  filesystem: 'ファイルシステム',
  database: 'データベース',
  api: 'API',
  development: '開発ツール',
  productivity: '生産性',
  custom: 'カスタム',
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-jarvis-border flex items-center justify-between">
      <h2 class="text-lg font-semibold text-cyan-300">MCP Server Configuration</h2>
      <div class="flex items-center gap-2">
        <GlowButton variant="outline" size="sm" @click="mcpStore.loadServers">
          <RefreshCw class="w-4 h-4" />
          <span>更新</span>
        </GlowButton>
        <GlowButton size="sm" @click="showTemplateGallery = true">
          <Plus class="w-4 h-4" />
          <span>追加</span>
        </GlowButton>
      </div>
    </div>

    <!-- Search -->
    <div class="p-4 border-b border-jarvis-border">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jarvis-text-muted" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="サーバーを検索..."
          class="w-full pl-10 pr-4 py-2 bg-jarvis-surface border border-jarvis-border rounded-lg text-jarvis-text-primary placeholder-jarvis-text-muted focus:border-cyan-400/50 focus:outline-none"
        />
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="p-4 bg-red-500/10 border-b border-red-400/30 text-red-300 text-sm">
      {{ error }}
    </div>

    <!-- Server List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
      </div>

      <template v-else-if="Object.keys(serversByCategory).length > 0">
        <div v-for="(categoryServers, category) in serversByCategory" :key="category" class="space-y-3">
          <h3 class="text-xs font-medium text-jarvis-text-muted uppercase tracking-wider">
            {{ categoryLabels[category] || category }}
          </h3>
          <div class="space-y-2">
            <MCPServerCard
              v-for="server in categoryServers"
              :key="server.id"
              :server="server"
              @edit="handleEditServer(server)"
              @delete="handleDeleteServer(server.id)"
              @toggle="handleToggleServer(server.id)"
              @test="handleTestConnection(server.id)"
            />
          </div>
        </div>
      </template>

      <div v-else class="text-center py-8 text-jarvis-text-muted">
        <p>MCPサーバーが設定されていません</p>
        <p class="text-sm mt-2">「追加」ボタンからサーバーを追加してください</p>
      </div>
    </div>

    <!-- Template Gallery Dialog -->
    <MCPTemplateGallery
      v-if="showTemplateGallery"
      @close="showTemplateGallery = false"
      @select="handleAddFromTemplate"
    />

    <!-- Server Edit Dialog -->
    <MCPServerDialog
      v-if="showServerDialog"
      :server="editingServer"
      @close="showServerDialog = false; editingServer = null"
      @save="handleSaveServer"
    />
  </div>
</template>
