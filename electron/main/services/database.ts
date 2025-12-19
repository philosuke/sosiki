import { ipcMain } from 'electron'
import Store from 'electron-store'
import { v4 as uuidv4 } from 'uuid'

interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  input_tokens?: number
  output_tokens?: number
  created_at: string
}

interface Conversation {
  id: string
  title: string
  project_id?: string
  system_prompt?: string
  is_favorite: boolean
  created_at: string
  updated_at: string
}

interface DatabaseSchema {
  conversations: Record<string, Conversation>
  messages: Record<string, Message[]>
}

const store = new Store<DatabaseSchema>({
  name: 'claudis-data',
  defaults: {
    conversations: {},
    messages: {},
  },
})

export async function initDatabase(): Promise<void> {
  setupDatabaseHandlers()
}

function setupDatabaseHandlers() {
  // Get all conversations
  ipcMain.handle('db:get-conversations', () => {
    const conversations = store.get('conversations', {})
    return Object.values(conversations).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
  })

  // Get single conversation with messages
  ipcMain.handle('db:get-conversation', (_event, id: string) => {
    const conversations = store.get('conversations', {})
    const conversation = conversations[id]

    if (!conversation) return null

    const allMessages = store.get('messages', {})
    const messages = allMessages[id] || []

    return { ...conversation, messages }
  })

  // Create conversation
  ipcMain.handle('db:create-conversation', (_event, data: any) => {
    const id = uuidv4()
    const now = new Date().toISOString()

    const conversation: Conversation = {
      id,
      title: data.title || 'New Conversation',
      project_id: data.projectId,
      system_prompt: data.systemPrompt,
      is_favorite: data.isFavorite || false,
      created_at: now,
      updated_at: now,
    }

    const conversations = store.get('conversations', {})
    conversations[id] = conversation
    store.set('conversations', conversations)

    // Initialize empty messages array
    const messages = store.get('messages', {})
    messages[id] = []
    store.set('messages', messages)

    return { id, ...data, createdAt: now, updatedAt: now }
  })

  // Update conversation
  ipcMain.handle('db:update-conversation', (_event, id: string, data: any) => {
    const conversations = store.get('conversations', {})
    const conversation = conversations[id]

    if (!conversation) return

    const now = new Date().toISOString()

    if (data.title !== undefined) conversation.title = data.title
    if (data.projectId !== undefined) conversation.project_id = data.projectId
    if (data.systemPrompt !== undefined) conversation.system_prompt = data.systemPrompt
    if (data.isFavorite !== undefined) conversation.is_favorite = data.isFavorite

    conversation.updated_at = now

    conversations[id] = conversation
    store.set('conversations', conversations)
  })

  // Delete conversation
  ipcMain.handle('db:delete-conversation', (_event, id: string) => {
    const conversations = store.get('conversations', {})
    delete conversations[id]
    store.set('conversations', conversations)

    const messages = store.get('messages', {})
    delete messages[id]
    store.set('messages', messages)
  })

  // Add message
  ipcMain.handle('db:add-message', (_event, conversationId: string, message: any) => {
    const id = uuidv4()
    const now = new Date().toISOString()

    const newMessage: Message = {
      id,
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      input_tokens: message.inputTokens,
      output_tokens: message.outputTokens,
      created_at: now,
    }

    const messages = store.get('messages', {})
    if (!messages[conversationId]) {
      messages[conversationId] = []
    }
    messages[conversationId].push(newMessage)
    store.set('messages', messages)

    // Update conversation updated_at
    const conversations = store.get('conversations', {})
    if (conversations[conversationId]) {
      conversations[conversationId].updated_at = now
      store.set('conversations', conversations)
    }

    return { id, ...message, createdAt: now }
  })

  // Get messages for conversation
  ipcMain.handle('db:get-messages', (_event, conversationId: string) => {
    const messages = store.get('messages', {})
    return messages[conversationId] || []
  })

  // Search messages
  ipcMain.handle('db:search-messages', (_event, query: string) => {
    const conversations = store.get('conversations', {})
    const allMessages = store.get('messages', {})
    const results: any[] = []
    const lowerQuery = query.toLowerCase()

    for (const [convId, msgs] of Object.entries(allMessages)) {
      const conv = conversations[convId]
      if (!conv) continue

      for (const msg of msgs) {
        if (msg.content.toLowerCase().includes(lowerQuery)) {
          results.push({
            ...msg,
            conversation_title: conv.title,
          })
        }
      }
    }

    return results
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50)
  })
}

export function closeDatabase() {
  // No-op for electron-store
}
