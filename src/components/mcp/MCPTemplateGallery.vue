<script setup lang="ts">
import { X, Folder, Database, Globe, Code, Search, Briefcase } from 'lucide-vue-next'
import GlowCard from '../jarvis/GlowCard.vue'
import type { MCPServerConfig } from '../../types/mcp'

const emit = defineEmits<{
  close: []
  select: [template: Omit<MCPServerConfig, 'id'>]
}>()

const templates: Omit<MCPServerConfig, 'id'>[] = [
  {
    name: 'File System',
    enabled: false,
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '${HOME}'],
    env: {},
    category: 'filesystem',
    description: 'ローカルファイルシステムへのアクセス',
    icon: 'folder',
  },
  {
    name: 'GitHub',
    enabled: false,
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: '${GITHUB_TOKEN}',
    },
    category: 'development',
    description: 'GitHubリポジトリの操作',
    icon: 'github',
  },
  {
    name: 'PostgreSQL',
    enabled: false,
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres', '${DATABASE_URL}'],
    env: {},
    category: 'database',
    description: 'PostgreSQLデータベースクエリ',
    icon: 'database',
  },
  {
    name: 'SQLite',
    enabled: false,
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sqlite', '${SQLITE_PATH}'],
    env: {},
    category: 'database',
    description: 'SQLiteデータベース操作',
    icon: 'database',
  },
  {
    name: 'Brave Search',
    enabled: false,
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    env: {
      BRAVE_API_KEY: '${BRAVE_API_KEY}',
    },
    category: 'api',
    description: 'Brave Search APIを使用したWeb検索',
    icon: 'search',
  },
  {
    name: 'Puppeteer',
    enabled: false,
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    env: {},
    category: 'development',
    description: 'ブラウザ自動化',
    icon: 'globe',
  },
]

const categoryIcons: Record<string, any> = {
  filesystem: Folder,
  database: Database,
  api: Globe,
  development: Code,
  productivity: Briefcase,
}

function selectTemplate(template: Omit<MCPServerConfig, 'id'>) {
  emit('select', { ...template })
}
</script>

<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div class="w-full max-w-2xl bg-jarvis-surface border border-jarvis-border rounded-lg shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-jarvis-border">
        <h3 class="text-lg font-semibold text-cyan-300">テンプレートから追加</h3>
        <button
          class="p-2 text-jarvis-text-muted hover:text-jarvis-text-primary rounded-lg hover:bg-jarvis-surface-hover transition-colors"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Templates Grid -->
      <div class="p-4 max-h-[60vh] overflow-y-auto">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <!-- Official Templates -->
          <button
            v-for="template in templates"
            :key="template.name"
            class="text-left"
            @click="selectTemplate(template)"
          >
            <GlowCard class="p-4 h-full hover:border-cyan-400/50 cursor-pointer transition-all">
              <div class="flex flex-col items-center text-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                  <component :is="categoryIcons[template.category || 'custom']" class="w-6 h-6" />
                </div>
                <div>
                  <h4 class="font-medium text-jarvis-text-primary">{{ template.name }}</h4>
                  <p class="text-xs text-jarvis-text-muted mt-1 line-clamp-2">
                    {{ template.description }}
                  </p>
                </div>
              </div>
            </GlowCard>
          </button>

          <!-- Empty/Custom -->
          <button class="text-left" @click="emit('select', { name: '', enabled: true, command: '', args: [], env: {}, category: 'custom' })">
            <GlowCard class="p-4 h-full hover:border-cyan-400/50 cursor-pointer transition-all border-dashed">
              <div class="flex flex-col items-center text-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-jarvis-surface flex items-center justify-center text-jarvis-text-muted border border-dashed border-jarvis-border">
                  <span class="text-2xl">+</span>
                </div>
                <div>
                  <h4 class="font-medium text-jarvis-text-secondary">空のサーバー</h4>
                  <p class="text-xs text-jarvis-text-muted mt-1">
                    カスタム設定
                  </p>
                </div>
              </div>
            </GlowCard>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
