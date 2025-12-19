import { contextBridge, ipcRenderer } from 'electron'
import type { ChatMessage, SendMessageOptions } from '../../src/types/chat'
import type { MCPServerConfig } from '../../src/types/mcp'
import type { AppSettings } from '../../src/types/settings'

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    onMaximizedChange: (callback: (isMaximized: boolean) => void) => {
      ipcRenderer.on('window:maximized-changed', (_event, isMaximized) => callback(isMaximized))
    },
  },

  // Claude API
  claude: {
    sendMessage: (messages: ChatMessage[], options?: SendMessageOptions) =>
      ipcRenderer.invoke('claude:send-message', messages, options),
    streamMessage: (messages: ChatMessage[], options?: SendMessageOptions) => {
      const channel = `claude:stream-${Date.now()}`
      ipcRenderer.invoke('claude:stream-message', messages, options, channel)
      return {
        onDelta: (callback: (delta: string) => void) => {
          ipcRenderer.on(`${channel}:delta`, (_event, delta) => callback(delta))
        },
        onComplete: (callback: (response: any) => void) => {
          ipcRenderer.on(`${channel}:complete`, (_event, response) => callback(response))
        },
        onError: (callback: (error: any) => void) => {
          ipcRenderer.on(`${channel}:error`, (_event, error) => callback(error))
        },
        cancel: () => {
          ipcRenderer.invoke(`${channel}:cancel`)
        },
        cleanup: () => {
          ipcRenderer.removeAllListeners(`${channel}:delta`)
          ipcRenderer.removeAllListeners(`${channel}:complete`)
          ipcRenderer.removeAllListeners(`${channel}:error`)
        },
      }
    },
    cancel: () => ipcRenderer.invoke('claude:cancel'),
  },

  // MCP
  mcp: {
    listServers: () => ipcRenderer.invoke('mcp:list-servers'),
    addServer: (config: MCPServerConfig) => ipcRenderer.invoke('mcp:add-server', config),
    removeServer: (id: string) => ipcRenderer.invoke('mcp:remove-server', id),
    updateServer: (id: string, config: Partial<MCPServerConfig>) =>
      ipcRenderer.invoke('mcp:update-server', id, config),
    testConnection: (id: string) => ipcRenderer.invoke('mcp:test-connection', id),
    getServerStatus: (id: string) => ipcRenderer.invoke('mcp:get-server-status', id),
    restartServer: (id: string) => ipcRenderer.invoke('mcp:restart-server', id),
    onStatusChange: (callback: (id: string, status: string) => void) => {
      ipcRenderer.on('mcp:status-changed', (_event, id, status) => callback(id, status))
    },
  },

  // Settings
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (settings: Partial<AppSettings>) => ipcRenderer.invoke('settings:set', settings),
    reset: () => ipcRenderer.invoke('settings:reset'),
  },

  // Secure storage
  secure: {
    getApiKey: () => ipcRenderer.invoke('secure:get-api-key'),
    setApiKey: (key: string) => ipcRenderer.invoke('secure:set-api-key', key),
    deleteApiKey: () => ipcRenderer.invoke('secure:delete-api-key'),
    getEnvVar: (name: string) => ipcRenderer.invoke('secure:get-env-var', name),
    setEnvVar: (name: string, value: string) => ipcRenderer.invoke('secure:set-env-var', name, value),
  },

  // Database
  database: {
    getConversations: () => ipcRenderer.invoke('db:get-conversations'),
    getConversation: (id: string) => ipcRenderer.invoke('db:get-conversation', id),
    createConversation: (data: any) => ipcRenderer.invoke('db:create-conversation', data),
    updateConversation: (id: string, data: any) => ipcRenderer.invoke('db:update-conversation', id, data),
    deleteConversation: (id: string) => ipcRenderer.invoke('db:delete-conversation', id),
    addMessage: (conversationId: string, message: any) =>
      ipcRenderer.invoke('db:add-message', conversationId, message),
    getMessages: (conversationId: string) => ipcRenderer.invoke('db:get-messages', conversationId),
    searchMessages: (query: string) => ipcRenderer.invoke('db:search-messages', query),
  },
})

// Type declarations for the renderer process
declare global {
  interface Window {
    electronAPI: {
      window: {
        minimize: () => Promise<void>
        maximize: () => Promise<void>
        close: () => Promise<void>
        isMaximized: () => Promise<boolean>
        onMaximizedChange: (callback: (isMaximized: boolean) => void) => void
      }
      claude: {
        sendMessage: (messages: ChatMessage[], options?: SendMessageOptions) => Promise<any>
        streamMessage: (messages: ChatMessage[], options?: SendMessageOptions) => {
          onDelta: (callback: (delta: string) => void) => void
          onComplete: (callback: (response: any) => void) => void
          onError: (callback: (error: any) => void) => void
          cancel: () => void
          cleanup: () => void
        }
        cancel: () => Promise<void>
      }
      mcp: {
        listServers: () => Promise<MCPServerConfig[]>
        addServer: (config: MCPServerConfig) => Promise<void>
        removeServer: (id: string) => Promise<void>
        updateServer: (id: string, config: Partial<MCPServerConfig>) => Promise<void>
        testConnection: (id: string) => Promise<{ success: boolean; error?: string }>
        getServerStatus: (id: string) => Promise<string>
        restartServer: (id: string) => Promise<void>
        onStatusChange: (callback: (id: string, status: string) => void) => void
      }
      settings: {
        get: () => Promise<AppSettings>
        set: (settings: Partial<AppSettings>) => Promise<void>
        reset: () => Promise<void>
      }
      secure: {
        getApiKey: () => Promise<string | null>
        setApiKey: (key: string) => Promise<void>
        deleteApiKey: () => Promise<boolean>
        getEnvVar: (name: string) => Promise<string | null>
        setEnvVar: (name: string, value: string) => Promise<void>
      }
      database: {
        getConversations: () => Promise<any[]>
        getConversation: (id: string) => Promise<any>
        createConversation: (data: any) => Promise<any>
        updateConversation: (id: string, data: any) => Promise<void>
        deleteConversation: (id: string) => Promise<void>
        addMessage: (conversationId: string, message: any) => Promise<any>
        getMessages: (conversationId: string) => Promise<any[]>
        searchMessages: (query: string) => Promise<any[]>
      }
    }
  }
}
