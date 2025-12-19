export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  attachments?: Attachment[]
  createdAt?: Date | string
  tokens?: {
    input: number
    output: number
  }
}

export interface Attachment {
  id: string
  type: 'image' | 'file'
  name: string
  mimeType?: string
  size?: number
  data?: string | ArrayBuffer
  url?: string
}

export interface SendMessageOptions {
  model?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
  tools?: Tool[]
  stream?: boolean
}

export interface Tool {
  name: string
  description: string
  input_schema: Record<string, any>
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date | string
  updatedAt: Date | string
  tags?: string[]
  isFavorite?: boolean
  projectId?: string
  systemPrompt?: string
}

export interface ChatResponse {
  id: string
  content: string
  model: string
  usage: {
    inputTokens: number
    outputTokens: number
  }
  stopReason?: string
}

export interface StreamEvent {
  type: 'delta' | 'complete' | 'error'
  data: string | ChatResponse | Error
}
