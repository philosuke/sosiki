import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatMessage, Conversation, SendMessageOptions } from '../types/chat'
import { generateId } from '../lib/utils'
import { useSettingsStore } from './settings'

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<Conversation[]>([])
  const currentConversationId = ref<string | null>(null)
  const isLoading = ref(false)
  const isStreaming = ref(false)
  const error = ref<string | null>(null)
  const streamController = ref<{ cancel: () => void; cleanup: () => void } | null>(null)

  // Current conversation
  const currentConversation = computed(() =>
    conversations.value.find(c => c.id === currentConversationId.value)
  )

  // Current messages
  const messages = computed(() => currentConversation.value?.messages || [])

  // Load conversations from database
  async function loadConversations() {
    try {
      const data = await window.electronAPI.database.getConversations()
      conversations.value = data.map(c => ({
        ...c,
        messages: [],
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at),
      }))
    } catch (e) {
      console.error('Failed to load conversations:', e)
    }
  }

  // Create new conversation
  async function createConversation(title?: string, systemPrompt?: string) {
    const data = await window.electronAPI.database.createConversation({
      title: title || 'New Conversation',
      systemPrompt,
    })

    const conversation: Conversation = {
      id: data.id,
      title: data.title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      systemPrompt,
    }

    conversations.value.unshift(conversation)
    currentConversationId.value = conversation.id

    return conversation
  }

  // Select conversation
  async function selectConversation(id: string) {
    currentConversationId.value = id

    // Load messages if not already loaded
    const conv = conversations.value.find(c => c.id === id)
    if (conv && conv.messages.length === 0) {
      const msgs = await window.electronAPI.database.getMessages(id)
      conv.messages = msgs.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: new Date(m.created_at),
        tokens: m.input_tokens || m.output_tokens ? {
          input: m.input_tokens || 0,
          output: m.output_tokens || 0,
        } : undefined,
      }))
    }
  }

  // Delete conversation
  async function deleteConversation(id: string) {
    await window.electronAPI.database.deleteConversation(id)
    conversations.value = conversations.value.filter(c => c.id !== id)

    if (currentConversationId.value === id) {
      currentConversationId.value = conversations.value[0]?.id || null
    }
  }

  // Send message
  async function sendMessage(content: string, options?: SendMessageOptions) {
    if (!currentConversationId.value) {
      await createConversation()
    }

    const conversationId = currentConversationId.value!
    const conversation = conversations.value.find(c => c.id === conversationId)!
    const settingsStore = useSettingsStore()

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      createdAt: new Date(),
    }

    conversation.messages.push(userMessage)
    await window.electronAPI.database.addMessage(conversationId, userMessage)

    // Add placeholder for assistant message
    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      createdAt: new Date(),
    }
    conversation.messages.push(assistantMessage)

    isLoading.value = true
    isStreaming.value = true
    error.value = null

    try {
      const messageHistory = conversation.messages.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const stream = window.electronAPI.claude.streamMessage(messageHistory, {
        model: options?.model || settingsStore.model,
        maxTokens: options?.maxTokens || settingsStore.maxTokens,
        temperature: options?.temperature || settingsStore.temperature,
        systemPrompt: options?.systemPrompt || conversation.systemPrompt,
      })

      streamController.value = stream

      stream.onDelta((delta) => {
        assistantMessage.content += delta
      })

      stream.onComplete(async (response) => {
        assistantMessage.tokens = {
          input: response.usage?.inputTokens || 0,
          output: response.usage?.outputTokens || 0,
        }

        // Save to database
        await window.electronAPI.database.addMessage(conversationId, {
          role: 'assistant',
          content: assistantMessage.content,
          inputTokens: assistantMessage.tokens.input,
          outputTokens: assistantMessage.tokens.output,
        })

        // Update conversation title if first message
        if (conversation.messages.length <= 2 && conversation.title === 'New Conversation') {
          const title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
          await window.electronAPI.database.updateConversation(conversationId, { title })
          conversation.title = title
        }

        isLoading.value = false
        isStreaming.value = false
        streamController.value = null
      })

      stream.onError((err) => {
        error.value = err.message || 'An error occurred'
        // Remove empty assistant message on error
        conversation.messages.pop()
        isLoading.value = false
        isStreaming.value = false
        streamController.value = null
      })

    } catch (e: any) {
      error.value = e.message || 'An error occurred'
      // Remove empty assistant message on error
      conversation.messages.pop()
      isLoading.value = false
      isStreaming.value = false
    }
  }

  // Cancel current stream
  function cancelStream() {
    if (streamController.value) {
      streamController.value.cancel()
      streamController.value.cleanup()
      streamController.value = null
      isStreaming.value = false
      isLoading.value = false
    }
  }

  // Clear current conversation messages
  function clearMessages() {
    if (currentConversation.value) {
      currentConversation.value.messages = []
    }
  }

  return {
    conversations,
    currentConversationId,
    currentConversation,
    messages,
    isLoading,
    isStreaming,
    error,
    loadConversations,
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
    cancelStream,
    clearMessages,
  }
})
