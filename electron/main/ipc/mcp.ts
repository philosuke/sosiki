import { IpcMain, BrowserWindow } from 'electron'
import { spawn, ChildProcess } from 'child_process'
import { getMCPConfig, saveMCPConfig, type MCPServerConfig } from '../services/mcp-config'
import { getEnvVar } from '../services/secure-store'

interface MCPProcess {
  process: ChildProcess
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastError?: string
}

const mcpProcesses = new Map<string, MCPProcess>()

function resolveEnvVariables(value: string): Promise<string> {
  return new Promise(async (resolve) => {
    const envVarPattern = /\$\{([^}]+)\}/g
    let result = value
    const matches = value.matchAll(envVarPattern)

    for (const match of matches) {
      const varName = match[1]
      const envValue = await getEnvVar(varName) || process.env[varName] || ''
      result = result.replace(match[0], envValue)
    }

    resolve(result)
  })
}

async function startMCPServer(config: MCPServerConfig, mainWindow?: BrowserWindow): Promise<void> {
  if (!config.enabled) return

  // Stop existing process if running
  await stopMCPServer(config.id)

  // Resolve environment variables in args
  const resolvedArgs = await Promise.all(
    config.args.map(arg => resolveEnvVariables(arg))
  )

  // Resolve environment variables in env
  const resolvedEnv: Record<string, string> = {}
  for (const [key, value] of Object.entries(config.env || {})) {
    resolvedEnv[key] = await resolveEnvVariables(value)
  }

  try {
    const proc = spawn(config.command, resolvedArgs, {
      env: { ...process.env, ...resolvedEnv },
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    const mcpProc: MCPProcess = {
      process: proc,
      status: 'connecting',
    }

    mcpProcesses.set(config.id, mcpProc)

    proc.stdout?.on('data', (data) => {
      // Handle MCP protocol messages
      console.log(`[MCP ${config.name}] stdout:`, data.toString())
    })

    proc.stderr?.on('data', (data) => {
      console.error(`[MCP ${config.name}] stderr:`, data.toString())
    })

    proc.on('spawn', () => {
      mcpProc.status = 'connected'
      mainWindow?.webContents.send('mcp:status-changed', config.id, 'connected')
    })

    proc.on('error', (error) => {
      mcpProc.status = 'error'
      mcpProc.lastError = error.message
      mainWindow?.webContents.send('mcp:status-changed', config.id, 'error')
    })

    proc.on('close', (code) => {
      if (code !== 0) {
        mcpProc.status = 'error'
        mcpProc.lastError = `Process exited with code ${code}`
      } else {
        mcpProc.status = 'disconnected'
      }
      mainWindow?.webContents.send('mcp:status-changed', config.id, mcpProc.status)
    })

  } catch (error: any) {
    const mcpProc: MCPProcess = {
      process: null as any,
      status: 'error',
      lastError: error.message,
    }
    mcpProcesses.set(config.id, mcpProc)
    throw error
  }
}

async function stopMCPServer(id: string): Promise<void> {
  const mcpProc = mcpProcesses.get(id)
  if (mcpProc?.process) {
    mcpProc.process.kill()
    mcpProcesses.delete(id)
  }
}

export function setupMCPHandlers(ipcMain: IpcMain) {
  // List servers
  ipcMain.handle('mcp:list-servers', async () => {
    const config = await getMCPConfig()
    return Object.entries(config.mcpServers || {}).map(([id, server]) => ({
      id,
      ...server,
      status: mcpProcesses.get(id)?.status || 'disconnected',
      lastError: mcpProcesses.get(id)?.lastError,
    }))
  })

  // Add server
  ipcMain.handle('mcp:add-server', async (_event, config: MCPServerConfig) => {
    const mcpConfig = await getMCPConfig()
    mcpConfig.mcpServers = mcpConfig.mcpServers || {}
    mcpConfig.mcpServers[config.id] = config
    await saveMCPConfig(mcpConfig)

    if (config.enabled) {
      const window = BrowserWindow.fromWebContents(_event.sender)
      await startMCPServer(config, window || undefined)
    }
  })

  // Remove server
  ipcMain.handle('mcp:remove-server', async (_event, id: string) => {
    await stopMCPServer(id)

    const mcpConfig = await getMCPConfig()
    if (mcpConfig.mcpServers) {
      delete mcpConfig.mcpServers[id]
      await saveMCPConfig(mcpConfig)
    }
  })

  // Update server
  ipcMain.handle('mcp:update-server', async (_event, id: string, updates: Partial<MCPServerConfig>) => {
    const mcpConfig = await getMCPConfig()
    if (mcpConfig.mcpServers?.[id]) {
      mcpConfig.mcpServers[id] = { ...mcpConfig.mcpServers[id], ...updates }
      await saveMCPConfig(mcpConfig)

      // Restart if enabled status changed or server is enabled
      if (updates.enabled !== undefined || mcpConfig.mcpServers[id].enabled) {
        await stopMCPServer(id)
        if (mcpConfig.mcpServers[id].enabled) {
          const window = BrowserWindow.fromWebContents(_event.sender)
          await startMCPServer(mcpConfig.mcpServers[id], window || undefined)
        }
      }
    }
  })

  // Test connection
  ipcMain.handle('mcp:test-connection', async (_event, id: string) => {
    const mcpConfig = await getMCPConfig()
    const server = mcpConfig.mcpServers?.[id]

    if (!server) {
      return { success: false, error: 'Server not found' }
    }

    try {
      const window = BrowserWindow.fromWebContents(_event.sender)
      await startMCPServer({ ...server, id }, window || undefined)

      // Wait a bit to see if it connects
      await new Promise(resolve => setTimeout(resolve, 2000))

      const proc = mcpProcesses.get(id)
      if (proc?.status === 'connected') {
        return { success: true }
      } else {
        return { success: false, error: proc?.lastError || 'Connection failed' }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Get server status
  ipcMain.handle('mcp:get-server-status', async (_event, id: string) => {
    return mcpProcesses.get(id)?.status || 'disconnected'
  })

  // Restart server
  ipcMain.handle('mcp:restart-server', async (_event, id: string) => {
    const mcpConfig = await getMCPConfig()
    const server = mcpConfig.mcpServers?.[id]

    if (server) {
      await stopMCPServer(id)
      const window = BrowserWindow.fromWebContents(_event.sender)
      await startMCPServer({ ...server, id }, window || undefined)
    }
  })
}
