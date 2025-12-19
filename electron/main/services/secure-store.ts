// Note: keytar requires native compilation, so we provide a fallback for development
// In production, keytar should be properly compiled for the target platform

const SERVICE_NAME = 'CLAUDIS'

// Try to use keytar, fall back to electron-store for development
let keytar: any = null
let fallbackStore: any = null

async function getKeytar() {
  if (keytar) return keytar

  try {
    keytar = await import('keytar')
    return keytar
  } catch {
    // Fallback to electron-store if keytar is not available
    if (!fallbackStore) {
      const Store = (await import('electron-store')).default
      fallbackStore = new Store({
        name: 'claudis-secrets',
        encryptionKey: 'claudis-dev-key', // Only for development fallback
      })
    }
    return null
  }
}

export async function setApiKey(key: string): Promise<void> {
  const kt = await getKeytar()
  if (kt) {
    await kt.setPassword(SERVICE_NAME, 'claude-api-key', key)
  } else {
    fallbackStore.set('claude-api-key', key)
  }
}

export async function getApiKey(): Promise<string | null> {
  const kt = await getKeytar()
  if (kt) {
    return kt.getPassword(SERVICE_NAME, 'claude-api-key')
  } else {
    return fallbackStore?.get('claude-api-key') || null
  }
}

export async function deleteApiKey(): Promise<boolean> {
  const kt = await getKeytar()
  if (kt) {
    return kt.deletePassword(SERVICE_NAME, 'claude-api-key')
  } else {
    fallbackStore?.delete('claude-api-key')
    return true
  }
}

export async function setEnvVar(name: string, value: string): Promise<void> {
  const kt = await getKeytar()
  if (kt) {
    await kt.setPassword(SERVICE_NAME, `env:${name}`, value)
  } else {
    fallbackStore.set(`env:${name}`, value)
  }
}

export async function getEnvVar(name: string): Promise<string | null> {
  const kt = await getKeytar()
  if (kt) {
    return kt.getPassword(SERVICE_NAME, `env:${name}`)
  } else {
    return fallbackStore?.get(`env:${name}`) || null
  }
}

export async function deleteEnvVar(name: string): Promise<boolean> {
  const kt = await getKeytar()
  if (kt) {
    return kt.deletePassword(SERVICE_NAME, `env:${name}`)
  } else {
    fallbackStore?.delete(`env:${name}`)
    return true
  }
}
