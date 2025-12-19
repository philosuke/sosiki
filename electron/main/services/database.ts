import { app, ipcMain } from 'electron'
import { join } from 'path'
import Database from 'better-sqlite3'
import { nanoid } from 'nanoid'

let db: Database.Database | null = null

export async function initDatabase(): Promise<void> {
  const dbPath = join(app.getPath('userData'), 'claudis.db')
  db = new Database(dbPath)

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL')

  // Create tables
  db.exec(`
    -- Conversations table
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      project_id TEXT,
      system_prompt TEXT,
      is_favorite INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Messages table
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      input_tokens INTEGER,
      output_tokens INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    -- Attachments table
    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      mime_type TEXT,
      size INTEGER,
      data BLOB,
      created_at TEXT NOT NULL,
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
    );

    -- Tags table
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT
    );

    -- Conversation tags relation
    CREATE TABLE IF NOT EXISTS conversation_tags (
      conversation_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (conversation_id, tag_id),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    -- Projects table
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      system_prompt TEXT,
      icon TEXT,
      color TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_conversations_project ON conversations(project_id);
  `)

  // Setup IPC handlers for database operations
  setupDatabaseHandlers()
}

function setupDatabaseHandlers() {
  // Get all conversations
  ipcMain.handle('db:get-conversations', () => {
    const stmt = db!.prepare(`
      SELECT * FROM conversations
      ORDER BY updated_at DESC
    `)
    return stmt.all()
  })

  // Get single conversation with messages
  ipcMain.handle('db:get-conversation', (_event, id: string) => {
    const convStmt = db!.prepare('SELECT * FROM conversations WHERE id = ?')
    const conversation = convStmt.get(id)

    if (!conversation) return null

    const msgStmt = db!.prepare(`
      SELECT * FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
    `)
    const messages = msgStmt.all(id)

    return { ...conversation, messages }
  })

  // Create conversation
  ipcMain.handle('db:create-conversation', (_event, data: any) => {
    const id = nanoid()
    const now = new Date().toISOString()

    const stmt = db!.prepare(`
      INSERT INTO conversations (id, title, project_id, system_prompt, is_favorite, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      data.title || 'New Conversation',
      data.projectId || null,
      data.systemPrompt || null,
      data.isFavorite ? 1 : 0,
      now,
      now
    )

    return { id, ...data, createdAt: now, updatedAt: now }
  })

  // Update conversation
  ipcMain.handle('db:update-conversation', (_event, id: string, data: any) => {
    const now = new Date().toISOString()
    const fields: string[] = ['updated_at = ?']
    const values: any[] = [now]

    if (data.title !== undefined) {
      fields.push('title = ?')
      values.push(data.title)
    }
    if (data.projectId !== undefined) {
      fields.push('project_id = ?')
      values.push(data.projectId)
    }
    if (data.systemPrompt !== undefined) {
      fields.push('system_prompt = ?')
      values.push(data.systemPrompt)
    }
    if (data.isFavorite !== undefined) {
      fields.push('is_favorite = ?')
      values.push(data.isFavorite ? 1 : 0)
    }

    values.push(id)

    const stmt = db!.prepare(`
      UPDATE conversations SET ${fields.join(', ')} WHERE id = ?
    `)
    stmt.run(...values)
  })

  // Delete conversation
  ipcMain.handle('db:delete-conversation', (_event, id: string) => {
    const stmt = db!.prepare('DELETE FROM conversations WHERE id = ?')
    stmt.run(id)
  })

  // Add message
  ipcMain.handle('db:add-message', (_event, conversationId: string, message: any) => {
    const id = nanoid()
    const now = new Date().toISOString()

    const msgStmt = db!.prepare(`
      INSERT INTO messages (id, conversation_id, role, content, input_tokens, output_tokens, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    msgStmt.run(
      id,
      conversationId,
      message.role,
      message.content,
      message.inputTokens || null,
      message.outputTokens || null,
      now
    )

    // Update conversation updated_at
    const updateStmt = db!.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?')
    updateStmt.run(now, conversationId)

    return { id, ...message, createdAt: now }
  })

  // Get messages for conversation
  ipcMain.handle('db:get-messages', (_event, conversationId: string) => {
    const stmt = db!.prepare(`
      SELECT * FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
    `)
    return stmt.all(conversationId)
  })

  // Search messages
  ipcMain.handle('db:search-messages', (_event, query: string) => {
    const stmt = db!.prepare(`
      SELECT m.*, c.title as conversation_title
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.content LIKE ?
      ORDER BY m.created_at DESC
      LIMIT 50
    `)
    return stmt.all(`%${query}%`)
  })
}

export function closeDatabase() {
  db?.close()
}
