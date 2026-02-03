# Claude Code 活用事例管理システム - 引き継ぎプロンプト

## プロジェクト概要

Claude Codeの業務効率化活用事例を「自動収集 → 整理 → 検索 → 提案」する仕組みを構築中です。

### 技術スタック
- **言語**: TypeScript 5.3+
- **フロントエンド**: Next.js 14 (App Router)
- **スタイリング**: Tailwind CSS
- **パッケージ管理**: pnpm (モノレポ)
- **バリデーション**: Zod
- **デプロイ先**: Vercel

### 主要機能
1. **自動収集**: GitHub/Qiita/Zenn等からClaude Code関連事例を収集
2. **整理**: 12カテゴリ、タグ、難易度でデータを構造化
3. **検索**: キーワード、カテゴリ、タグ等で絞り込み
4. **提案**: ユーザーのコンテキストに基づいてスコアリング提案

---

## ディレクトリ構造

```
/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── packages/
    ├── core/                    # コアライブラリ
    │   └── src/
    │       ├── index.ts
    │       ├── client.ts        # クライアント用エクスポート
    │       ├── search-engine.ts
    │       ├── suggestion-engine.ts
    │       ├── collector-registry.ts
    │       ├── types/
    │       │   ├── usecase.ts   # UseCase型定義
    │       │   ├── category.ts  # カテゴリ定義
    │       │   ├── collector.ts
    │       │   └── suggestion.ts
    │       └── storage/
    │           ├── storage.interface.ts
    │           ├── json-storage.ts
    │           └── memory-storage.ts  # Vercel用
    │
    ├── collectors/
    │   ├── base/                # BaseCollector抽象クラス
    │   └── manual/              # 手動入力コレクター + サンプルデータ
    │
    └── web/                     # Next.js アプリ
        ├── next.config.js
        ├── vercel.json
        └── src/
            ├── app/
            │   ├── page.tsx     # ホーム
            │   ├── usecases/page.tsx  # 事例一覧
            │   ├── suggest/page.tsx   # 提案ページ
            │   └── api/
            │       ├── usecases/route.ts
            │       ├── search/route.ts
            │       └── suggest/route.ts
            ├── components/
            │   ├── SearchBar.tsx
            │   ├── CategoryFilter.tsx
            │   ├── UseCaseCard.tsx
            │   ├── DifficultyBadge.tsx
            │   ├── SuggestionForm.tsx
            │   └── SuggestionResult.tsx
            └── lib/
                └── storage.ts   # 共通ストレージモジュール
```

---

## 設定ファイル

### package.json (ルート)
```json
{
  "name": "claude-code-usecases",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter @usecases/web dev",
    "build": "pnpm --filter @usecases/core build && pnpm --filter @usecases/collector-base build && pnpm --filter @usecases/collector-manual build && pnpm --filter @usecases/web build",
    "build:usecases": "pnpm --filter @usecases/core build && pnpm --filter @usecases/collector-base build && pnpm --filter @usecases/collector-manual build && pnpm --filter @usecases/web build"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

### pnpm-workspace.yaml
```yaml
packages:
  - 'packages/*'
  - 'packages/collectors/*'
```

### tsconfig.base.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

---

## 12カテゴリ

| ID | 名前 | アイコン |
|----|------|---------|
| code-generation | コード生成 | ⚡ |
| code-review | コードレビュー | 🔍 |
| debugging | デバッグ | 🐛 |
| documentation | ドキュメント作成 | 📝 |
| testing | テスト作成 | 🧪 |
| refactoring | リファクタリング | 🔧 |
| architecture | 設計・アーキテクチャ | 🏗️ |
| learning | 学習・スキルアップ | 📚 |
| automation | 自動化・効率化 | 🤖 |
| data-analysis | データ分析 | 📊 |
| devops | DevOps・インフラ | 🚀 |
| other | その他 | 💡 |

---

## Vercelデプロイ設定

| 項目 | 値 |
|------|-----|
| Root Directory | `packages/web` |
| Framework | Next.js |
| Build Command | `cd ../.. && pnpm install && pnpm build` |
| Output Directory | `.next` |

---

## リクエスト

このリポジトリにClaude Code活用事例管理システムを実装してください。

上記の設計に従って、以下を行ってください：
1. ディレクトリ構造を作成
2. 各パッケージのコードを実装
3. ビルドが通ることを確認
4. mainブランチにコミット・プッシュ
5. Vercelでデプロイできる状態にする

サンプル事例は12件含めてください（テスト、ドキュメント、コード生成、デバッグ、レビュー、リファクタリング、SQL最適化、Reactコンポーネント生成、CI/CD、セキュリティ、APIクライアント生成、Gitコミットメッセージ生成）。
