export type MCPCategory =
  | 'filesystem'
  | 'database'
  | 'api'
  | 'development'
  | 'productivity'
  | 'custom'

export type MCPStatus = 'connected' | 'disconnected' | 'connecting' | 'error'

export interface MCPServerConfig {
  id: string
  name: string
  enabled: boolean
  command: string
  args: string[]
  env: Record<string, string>
  transport?: 'stdio' | 'sse'
  url?: string
  description?: string
  icon?: string
  category?: MCPCategory
  status?: MCPStatus
  lastError?: string
}

export interface MCPTool {
  name: string
  description: string
  inputSchema: Record<string, any>
}

export interface MCPResource {
  uri: string
  name: string
  description?: string
  mimeType?: string
}

export interface MCPPrompt {
  name: string
  description?: string
  arguments?: Array<{
    name: string
    description?: string
    required?: boolean
  }>
}

export interface MCPCapabilities {
  tools: MCPTool[]
  resources: MCPResource[]
  prompts: MCPPrompt[]
}

export interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>
}
