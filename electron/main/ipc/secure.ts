import { IpcMain } from 'electron'
import { getApiKey, setApiKey, deleteApiKey, getEnvVar, setEnvVar } from '../services/secure-store'

export function setupSecureHandlers(ipcMain: IpcMain) {
  ipcMain.handle('secure:get-api-key', async () => {
    return getApiKey()
  })

  ipcMain.handle('secure:set-api-key', async (_event, key: string) => {
    await setApiKey(key)
    // Reset the Claude client to use the new key
    const { resetClient } = await import('./claude')
    resetClient()
  })

  ipcMain.handle('secure:delete-api-key', async () => {
    return deleteApiKey()
  })

  ipcMain.handle('secure:get-env-var', async (_event, name: string) => {
    return getEnvVar(name)
  })

  ipcMain.handle('secure:set-env-var', async (_event, name: string, value: string) => {
    return setEnvVar(name, value)
  })
}
