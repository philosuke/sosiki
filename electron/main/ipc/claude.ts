import { IpcMain, BrowserWindow } from 'electron'
import Anthropic from '@anthropic-ai/sdk'
import { getApiKey } from '../services/secure-store'
import type { ChatMessage, SendMessageOptions } from '../../../src/types/chat'

let client: Anthropic | null = null
const activeStreams = new Map<string, AbortController>()

async function getClient(): Promise<Anthropic> {
  if (!client) {
    const apiKey = await getApiKey()
    if (!apiKey) {
      throw new Error('API key not configured')
    }
    client = new Anthropic({ apiKey })
  }
  return client
}

export function resetClient() {
  client = null
}

export function setupClaudeHandlers(ipcMain: IpcMain) {
  // Send message (non-streaming)
  ipcMain.handle('claude:send-message', async (_event, messages: ChatMessage[], options?: SendMessageOptions) => {
    try {
      const anthropic = await getClient()

      const formattedMessages = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))

      const response = await anthropic.messages.create({
        model: options?.model ?? 'claude-sonnet-4-20250514',
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 1,
        system: options?.systemPrompt,
        messages: formattedMessages,
      })

      return {
        id: response.id,
        content: response.content[0].type === 'text' ? response.content[0].text : '',
        model: response.model,
        usage: response.usage,
        stopReason: response.stop_reason,
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send message')
    }
  })

  // Stream message
  ipcMain.handle('claude:stream-message', async (event, messages: ChatMessage[], options: SendMessageOptions | undefined, channel: string) => {
    const abortController = new AbortController()
    activeStreams.set(channel, abortController)

    try {
      const anthropic = await getClient()

      const formattedMessages = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))

      const stream = await anthropic.messages.create({
        model: options?.model ?? 'claude-sonnet-4-20250514',
        max_tokens: options?.maxTokens ?? 4096,
        temperature: options?.temperature ?? 1,
        system: options?.systemPrompt,
        messages: formattedMessages,
        stream: true,
      })

      const window = BrowserWindow.fromWebContents(event.sender)
      if (!window) return

      let fullContent = ''
      let inputTokens = 0
      let outputTokens = 0

      for await (const event of stream) {
        if (abortController.signal.aborted) {
          break
        }

        if (event.type === 'content_block_delta') {
          const delta = event.delta
          if ('text' in delta) {
            fullContent += delta.text
            window.webContents.send(`${channel}:delta`, delta.text)
          }
        } else if (event.type === 'message_start') {
          inputTokens = event.message.usage?.input_tokens ?? 0
        } else if (event.type === 'message_delta') {
          outputTokens = event.usage?.output_tokens ?? 0
        }
      }

      window.webContents.send(`${channel}:complete`, {
        content: fullContent,
        usage: { inputTokens, outputTokens },
      })

    } catch (error: any) {
      const window = BrowserWindow.fromWebContents(event.sender)
      if (window) {
        window.webContents.send(`${channel}:error`, {
          message: error.message || 'Stream failed',
        })
      }
    } finally {
      activeStreams.delete(channel)
    }

    // Handle cancel for this stream
    ipcMain.handleOnce(`${channel}:cancel`, () => {
      const controller = activeStreams.get(channel)
      if (controller) {
        controller.abort()
        activeStreams.delete(channel)
      }
    })
  })

  // Cancel all streams
  ipcMain.handle('claude:cancel', () => {
    for (const [channel, controller] of activeStreams) {
      controller.abort()
      activeStreams.delete(channel)
    }
  })
}
