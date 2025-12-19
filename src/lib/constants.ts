// Available Claude models
export const CLAUDE_MODELS = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Best balance of intelligence and speed' },
  { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Most capable model' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Previous generation balanced model' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fast and efficient' },
] as const

// Default system prompts for projects
export const PROJECT_PRESETS = {
  general: {
    name: 'General',
    systemPrompt: 'You are CLAUDIS, a helpful AI assistant. Be concise, accurate, and helpful.',
    icon: 'bot',
    color: '#00D4FF',
  },
  coding: {
    name: 'Coding',
    systemPrompt: `You are CLAUDIS, an expert programming assistant. Help with:
- Writing clean, efficient code
- Debugging and fixing issues
- Code review and best practices
- Architecture and design patterns
Always explain your reasoning and provide working examples.`,
    icon: 'code',
    color: '#00FF88',
  },
  writing: {
    name: 'Writing',
    systemPrompt: `You are CLAUDIS, a professional writing assistant. Help with:
- Content creation and editing
- Grammar and style improvements
- Tone and voice adjustments
- Structure and organization
Provide clear, actionable feedback.`,
    icon: 'pen-tool',
    color: '#FFB800',
  },
  translation: {
    name: 'Translation',
    systemPrompt: `You are CLAUDIS, a professional translator. Provide:
- Accurate translations between Japanese and English
- Context-appropriate word choices
- Cultural considerations
- Multiple options when appropriate
Maintain the original tone and meaning.`,
    icon: 'languages',
    color: '#FF6B35',
  },
  analysis: {
    name: 'Analysis',
    systemPrompt: `You are CLAUDIS, a data and business analyst. Help with:
- Data interpretation and insights
- Business strategy analysis
- Market research synthesis
- Report generation
Provide clear, data-driven conclusions.`,
    icon: 'bar-chart',
    color: '#9B59B6',
  },
} as const

// Keyboard shortcuts
export const DEFAULT_SHORTCUTS = {
  sendMessage: 'Ctrl+Enter',
  newConversation: 'Ctrl+N',
  commandPalette: 'Ctrl+K',
  voiceInput: 'Ctrl+Shift+V',
  voiceOutput: 'Ctrl+Shift+R',
  settings: 'Ctrl+,',
  escape: 'Escape',
} as const

// Voice recognition languages
export const VOICE_LANGUAGES = [
  { code: 'ja-JP', name: '日本語' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'zh-CN', name: '中文 (简体)' },
  { code: 'ko-KR', name: '한국어' },
  { code: 'fr-FR', name: 'Français' },
  { code: 'de-DE', name: 'Deutsch' },
  { code: 'es-ES', name: 'Español' },
] as const

// MCP category icons
export const MCP_CATEGORY_ICONS = {
  filesystem: 'folder',
  database: 'database',
  api: 'globe',
  development: 'code',
  productivity: 'briefcase',
  custom: 'puzzle',
} as const

// MCP category colors
export const MCP_CATEGORY_COLORS = {
  filesystem: '#00D4FF',
  database: '#00FF88',
  api: '#FF6B35',
  development: '#9B59B6',
  productivity: '#FFB800',
  custom: '#8892B0',
} as const
