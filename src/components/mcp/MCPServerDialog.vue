<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Plus, Trash2, Zap } from 'lucide-vue-next'
import GlowButton from '../jarvis/GlowButton.vue'
import type { MCPServerConfig, MCPCategory } from '../../types/mcp'

const props = defineProps<{
  server: MCPServerConfig | null
}>()

const emit = defineEmits<{
  close: []
  save: [config: MCPServerConfig]
}>()

const formData = ref({
  name: '',
  command: '',
  args: [''],
  env: [] as { key: string; value: string }[],
  category: 'custom' as MCPCategory,
  enabled: true,
  description: '',
})

const isEditing = computed(() => !!props.server?.id)

watch(
  () => props.server,
  (server) => {
    if (server) {
      formData.value = {
        name: server.name || '',
        command: server.command || '',
        args: server.args?.length ? [...server.args] : [''],
        env: Object.entries(server.env || {}).map(([key, value]) => ({ key, value })),
        category: server.category || 'custom',
        enabled: server.enabled ?? true,
        description: server.description || '',
      }
    }
  },
  { immediate: true }
)

const categories: { value: MCPCategory; label: string }[] = [
  { value: 'filesystem', label: 'ファイルシステム' },
  { value: 'database', label: 'データベース' },
  { value: 'api', label: 'API' },
  { value: 'development', label: '開発ツール' },
  { value: 'productivity', label: '生産性' },
  { value: 'custom', label: 'カスタム' },
]

function addArg() {
  formData.value.args.push('')
}

function removeArg(index: number) {
  formData.value.args.splice(index, 1)
}

function addEnv() {
  formData.value.env.push({ key: '', value: '' })
}

function removeEnv(index: number) {
  formData.value.env.splice(index, 1)
}

function handleSubmit() {
  const config: MCPServerConfig = {
    id: props.server?.id || '',
    name: formData.value.name,
    command: formData.value.command,
    args: formData.value.args.filter(Boolean),
    env: Object.fromEntries(
      formData.value.env
        .filter(e => e.key)
        .map(e => [e.key, e.value])
    ),
    category: formData.value.category,
    enabled: formData.value.enabled,
    description: formData.value.description,
  }
  emit('save', config)
}
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div class="w-full max-w-lg bg-jarvis-surface border border-jarvis-border rounded-lg shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-jarvis-border">
        <h3 class="text-lg font-semibold text-cyan-300">
          {{ isEditing ? 'MCPサーバーを編集' : 'MCPサーバーを追加' }}
        </h3>
        <button
          class="p-2 text-jarvis-text-muted hover:text-jarvis-text-primary rounded-lg hover:bg-jarvis-surface-hover transition-colors"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form -->
      <form class="p-4 space-y-4 max-h-[60vh] overflow-y-auto" @submit.prevent="handleSubmit">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-jarvis-text-secondary mb-1">
            名前 <span class="text-red-400">*</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            required
            class="w-full px-3 py-2 bg-jarvis-background border border-jarvis-border rounded-lg text-jarvis-text-primary placeholder-jarvis-text-muted focus:border-cyan-400/50 focus:outline-none"
            placeholder="File System"
          />
        </div>

        <!-- Command -->
        <div>
          <label class="block text-sm font-medium text-jarvis-text-secondary mb-1">
            コマンド <span class="text-red-400">*</span>
          </label>
          <input
            v-model="formData.command"
            type="text"
            required
            class="w-full px-3 py-2 bg-jarvis-background border border-jarvis-border rounded-lg text-jarvis-text-primary placeholder-jarvis-text-muted focus:border-cyan-400/50 focus:outline-none font-mono text-sm"
            placeholder="npx"
          />
        </div>

        <!-- Arguments -->
        <div>
          <label class="block text-sm font-medium text-jarvis-text-secondary mb-1">
            引数
          </label>
          <div class="space-y-2">
            <div v-for="(arg, index) in formData.args" :key="index" class="flex gap-2">
              <input
                v-model="formData.args[index]"
                type="text"
                class="flex-1 px-3 py-2 bg-jarvis-background border border-jarvis-border rounded-lg text-jarvis-text-primary placeholder-jarvis-text-muted focus:border-cyan-400/50 focus:outline-none font-mono text-sm"
                placeholder="-y @modelcontextprotocol/server-filesystem"
              />
              <button
                type="button"
                class="p-2 text-jarvis-text-muted hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                @click="removeArg(index)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              class="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300"
              @click="addArg"
            >
              <Plus class="w-4 h-4" />
              引数を追加
            </button>
          </div>
        </div>

        <!-- Environment Variables -->
        <div>
          <label class="block text-sm font-medium text-jarvis-text-secondary mb-1">
            環境変数
          </label>
          <div class="space-y-2">
            <div v-for="(env, index) in formData.env" :key="index" class="flex gap-2">
              <input
                v-model="env.key"
                type="text"
                class="flex-1 px-3 py-2 bg-jarvis-background border border-jarvis-border rounded-lg text-jarvis-text-primary placeholder-jarvis-text-muted focus:border-cyan-400/50 focus:outline-none font-mono text-sm"
                placeholder="KEY"
              />
              <input
                v-model="env.value"
                type="password"
                class="flex-1 px-3 py-2 bg-jarvis-background border border-jarvis-border rounded-lg text-jarvis-text-primary placeholder-jarvis-text-muted focus:border-cyan-400/50 focus:outline-none font-mono text-sm"
                placeholder="value or ${VAR_NAME}"
              />
              <button
                type="button"
                class="p-2 text-jarvis-text-muted hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                @click="removeEnv(index)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              class="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300"
              @click="addEnv"
            >
              <Plus class="w-4 h-4" />
              環境変数を追加
            </button>
          </div>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-jarvis-text-secondary mb-1">
            カテゴリ
          </label>
          <select
            v-model="formData.category"
            class="w-full px-3 py-2 bg-jarvis-background border border-jarvis-border rounded-lg text-jarvis-text-primary focus:border-cyan-400/50 focus:outline-none"
          >
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </option>
          </select>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-jarvis-text-secondary mb-1">
            説明
          </label>
          <textarea
            v-model="formData.description"
            rows="2"
            class="w-full px-3 py-2 bg-jarvis-background border border-jarvis-border rounded-lg text-jarvis-text-primary placeholder-jarvis-text-muted focus:border-cyan-400/50 focus:outline-none resize-none"
            placeholder="サーバーの説明（任意）"
          />
        </div>
      </form>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-4 border-t border-jarvis-border">
        <GlowButton variant="outline" @click="emit('close')">
          キャンセル
        </GlowButton>
        <GlowButton @click="handleSubmit">
          {{ isEditing ? '更新' : '追加' }}
        </GlowButton>
      </div>
    </div>
  </div>
</template>
