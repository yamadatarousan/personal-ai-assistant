# Personal AI Assistant

🤖 デスクトップAIアシスタント - スクリーンショット解析で作業効率化

## 🎯 概要

Personal AI Assistantは、スクリーンショットをAIで解析して作業をサポートするデスクトップアプリケーションです。

### 主な機能
- 📸 **スクリーンショット解析** - 画面の内容をAIが理解・説明
- 🚀 **ワンクリック操作** - 簡単で高速な解析実行
- 🔒 **プライバシー重視** - ローカル中心の安全な処理
- ⚡ **ホットキー対応** - キーボードショートカットで即座にアクセス

## 🛠️ 技術スタック

- **Electron** - クロスプラットフォームデスクトップアプリ
- **React** + **TypeScript** - モダンなフロントエンド
- **Tailwind CSS** - 効率的なスタイリング
- **OpenAI GPT-4V** - 画像解析AI

## 🚀 開発ステータス

現在開発中です。進捗は以下の通り：

### Phase 1: MVP 🚧
- [x] プロジェクト初期化
- [ ] Electronセットアップ
- [ ] 基本UI作成
- [ ] スクリーンショット機能
- [ ] AI統合

## 📋 セットアップ

### 必要な環境
- Node.js 18+
- npm または yarn
- OpenAI API Key

### インストール
```bash
# リポジトリクローン
git clone https://github.com/yamadatarousan/personal-ai-assistant.git
cd personal-ai-assistant

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

### 設定
1. OpenAI API Keyを取得
2. アプリ内の設定画面でAPI Keyを入力

## 🎮 使用方法

1. アプリを起動
2. 「スクリーンショット」ボタンをクリック
3. 解析したい画面をキャプチャ
4. AIによる解析結果を確認

## 🔧 開発

### 開発コマンド
```bash
npm run dev          # 開発環境起動
npm run build        # プロダクションビルド
npm run test         # テスト実行
npm run lint         # コード品質チェック
```

### 開発ガイドライン
詳細な開発ルールは [CLAUDE.md](./CLAUDE.md) を参照してください。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🙏 謝辞

- OpenAI - GPT-4V API
- Electron コミュニティ
- React エコシステム

---

**Built with ❤️ for productivity and learning**
