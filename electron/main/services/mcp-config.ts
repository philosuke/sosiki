import { app } from 'electron'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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
  category?: 'filesystem' | 'database' | 'api' | 'development' | 'productivity' | 'custom'
}

export interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>
}

const defaultConfig: MCPConfig = {
  mcpServers: {},
}

function getConfigPath(): string {
  const userDataPath = app.getPath('userData')
  return join(userDataPath, 'mcp-config.json')
}

export async function getMCPConfig(): Promise<MCPConfig> {
  const configPath = getConfigPath()

  if (!existsSync(configPath)) {
    return { ...defaultConfig }
  }

  try {
    const content = await readFile(configPath, 'utf-8')
    return JSON.parse(content) as MCPConfig
  } catch {
    return { ...defaultConfig }
  }
}

export async function saveMCPConfig(config: MCPConfig): Promise<void> {
  const configPath = getConfigPath()
  const dir = join(configPath, '..')

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }

  await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')
}

// Template servers for quick setup
export const mcpTemplates: Omit<MCPServerConfig, 'id'>[] = [
  {
    name: 'File System',
    enabled: false,
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '${HOME}'],
    env: {},
    category: 'filesystem',
    description: 'Access local file system',
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
    description: 'GitHub repository operations',
    icon: 'github',
  },
  {
    name: 'PostgreSQL',
    enabled: false,
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres', '${DATABASE_URL}'],
    env: {},
    category: 'database',
    description: 'PostgreSQL database queries',
    icon: 'database',
  },
  {
    name: 'SQLite',
    enabled: false,
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sqlite', '${SQLITE_PATH}'],
    env: {},
    category: 'database',
    description: 'SQLite database operations',
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
    description: 'Web search using Brave',
    icon: 'search',
  },
  {
    name: 'Puppeteer',
    enabled: false,
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    env: {},
    category: 'development',
    description: 'Browser automation',
    icon: 'globe',
  },
]
