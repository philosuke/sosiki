import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MCPServerConfig, MCPStatus } from '../types/mcp'

export const useMCPStore = defineStore('mcp', () => {
  const servers = ref<MCPServerConfig[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const enabledServers = computed(() =>
    servers.value.filter(s => s.enabled)
  )

  const connectedCount = computed(() =>
    servers.value.filter(s => s.status === 'connected').length
  )

  const serversByCategory = computed(() => {
    const grouped: Record<string, MCPServerConfig[]> = {}
    for (const server of servers.value) {
      const category = server.category || 'custom'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(server)
    }
    return grouped
  })

  // Load servers
  async function loadServers() {
    isLoading.value = true
    error.value = null

    try {
      servers.value = await window.electronAPI.mcp.listServers()
    } catch (e: any) {
      error.value = e.message || 'Failed to load MCP servers'
      console.error('Failed to load MCP servers:', e)
    } finally {
      isLoading.value = false
    }
  }

  // Add server
  async function addServer(config: Omit<MCPServerConfig, 'id'>) {
    const id = crypto.randomUUID()
    const serverConfig: MCPServerConfig = {
      ...config,
      id,
      status: 'disconnected',
    }

    await window.electronAPI.mcp.addServer(serverConfig)
    servers.value.push(serverConfig)

    return serverConfig
  }

  // Update server
  async function updateServer(id: string, updates: Partial<MCPServerConfig>) {
    await window.electronAPI.mcp.updateServer(id, updates)

    const index = servers.value.findIndex(s => s.id === id)
    if (index !== -1) {
      servers.value[index] = { ...servers.value[index], ...updates }
    }
  }

  // Remove server
  async function removeServer(id: string) {
    await window.electronAPI.mcp.removeServer(id)
    servers.value = servers.value.filter(s => s.id !== id)
  }

  // Toggle server enabled
  async function toggleServer(id: string) {
    const server = servers.value.find(s => s.id === id)
    if (server) {
      await updateServer(id, { enabled: !server.enabled })
    }
  }

  // Test connection
  async function testConnection(id: string): Promise<{ success: boolean; error?: string }> {
    const server = servers.value.find(s => s.id === id)
    if (server) {
      server.status = 'connecting'
    }

    try {
      const result = await window.electronAPI.mcp.testConnection(id)

      if (server) {
        server.status = result.success ? 'connected' : 'error'
        server.lastError = result.error
      }

      return result
    } catch (e: any) {
      if (server) {
        server.status = 'error'
        server.lastError = e.message
      }
      return { success: false, error: e.message }
    }
  }

  // Restart server
  async function restartServer(id: string) {
    const server = servers.value.find(s => s.id === id)
    if (server) {
      server.status = 'connecting'
    }

    try {
      await window.electronAPI.mcp.restartServer(id)
    } catch (e: any) {
      if (server) {
        server.status = 'error'
        server.lastError = e.message
      }
    }
  }

  // Update server status (called from IPC)
  function updateStatus(id: string, status: MCPStatus) {
    const server = servers.value.find(s => s.id === id)
    if (server) {
      server.status = status
    }
  }

  // Setup status change listener
  function setupStatusListener() {
    window.electronAPI.mcp.onStatusChange((id, status) => {
      updateStatus(id, status as MCPStatus)
    })
  }

  return {
    servers,
    isLoading,
    error,
    enabledServers,
    connectedCount,
    serversByCategory,
    loadServers,
    addServer,
    updateServer,
    removeServer,
    toggleServer,
    testConnection,
    restartServer,
    updateStatus,
    setupStatusListener,
  }
})
