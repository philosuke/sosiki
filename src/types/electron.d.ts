import type { ChatMessage, SendMessageOptions } from './chat'
import type { MCPServerConfig } from './mcp'
import type { AppSettings } from './settings'

export interface ElectronAPI {
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

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
