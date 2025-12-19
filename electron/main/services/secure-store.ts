import Store from 'electron-store'

interface SecureSchema {
  apiKey?: string
  envVars: Record<string, string>
}

// Use electron-store with encryption for sensitive data
const secureStore = new Store<SecureSchema>({
  name: 'claudis-secrets',
  encryptionKey: 'claudis-secure-storage-key-v1',
  defaults: {
    envVars: {},
  },
})

export async function setApiKey(key: string): Promise<void> {
  secureStore.set('apiKey', key)
}

export async function getApiKey(): Promise<string | null> {
  return secureStore.get('apiKey') || null
}

export async function deleteApiKey(): Promise<boolean> {
  secureStore.delete('apiKey')
  return true
}

export async function setEnvVar(name: string, value: string): Promise<void> {
  const envVars = secureStore.get('envVars', {})
  envVars[name] = value
  secureStore.set('envVars', envVars)
}

export async function getEnvVar(name: string): Promise<string | null> {
  const envVars = secureStore.get('envVars', {})
  return envVars[name] || null
}

export async function deleteEnvVar(name: string): Promise<boolean> {
  const envVars = secureStore.get('envVars', {})
  delete envVars[name]
  secureStore.set('envVars', envVars)
  return true
}
