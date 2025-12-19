# CLAUDIS

> **CLAUDIS** - Claude Leveraged AI Desktop Interface System

アイアンマンのJARVIS/FRIDAYにインスパイアされた次世代AIアシスタントインターフェース

## Features

- **チャットインターフェース** - Claude APIを使用したテキストベースの対話
- **音声入力** - マイクからの音声をリアルタイムでテキスト変換
- **音声出力** - Claudeの応答を自然な音声で読み上げ
- **JARVIS風UI** - ホログラフィック、ネオングロー、アニメーション
- **MCP統合** - MCPサーバーの簡単な設定・管理
- **マルチモーダル** - 画像・ファイルのアップロード対応

## Tech Stack

- **Electron** - クロスプラットフォームデスクトップアプリ
- **Vue 3** - モダンなリアクティブUI
- **TypeScript** - 型安全な開発
- **Vite** - 高速なビルドツール
- **TailwindCSS** - ユーティリティファーストCSS
- **Pinia** - Vue 3用状態管理
- **SQLite** - ローカルデータベース

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build
```

### Configuration

1. アプリを起動
2. 設定画面からClaude APIキーを入力
3. 必要に応じてMCPサーバーを設定

## Project Structure

```
claudis/
├── electron/           # Electron main process
│   ├── main/          # Main process entry
│   └── preload/       # Preload scripts
├── src/               # Vue app source
│   ├── components/    # Vue components
│   ├── stores/        # Pinia stores
│   ├── types/         # TypeScript types
│   └── lib/           # Utilities
├── index.html         # HTML entry point
└── package.json
```

## Screenshots

Coming soon...

## License

MIT License

## Acknowledgments

- Inspired by Iron Man's JARVIS/FRIDAY
- Built with [Claude](https://anthropic.com) API
- Uses [Model Context Protocol](https://modelcontextprotocol.io/)
