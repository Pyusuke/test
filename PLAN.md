# 部品検索アプリ開発計画

## 概要
複数のECサイトから部品を横断検索できるWebアプリケーション。
拡張性を持たせ、後から新しいサイトを追加できる設計。

---

## 基本方針

| 項目 | 決定事項 |
|------|----------|
| アプリ形態 | Webアプリ |
| 開発言語 | TypeScript |
| フレームワーク | Next.js 14 (App Router) |
| パッケージ管理 | pnpm (monorepo) |

---

## 対応サイト（7サイト）

| サイト | URL | 特徴 |
|--------|-----|------|
| モノタロウ | monotaro.com | 工業用品総合 |
| ミスミ | misumi-ec.com | 機械部品・FA |
| Amazon | amazon.co.jp | 総合EC |
| 保守部品.com | hobuhin.com | 保守・メンテナンス部品 |
| ASKUL | askul.co.jp | オフィス・現場用品 |
| AXEL | axel.as-1.co.jp | 研究・実験用品 |
| アペルザ | aperza.com | 製造業向けマーケット |

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│                    検索UI・結果表示                          │
└─────────────────────┬───────────────────────────────────────┘
                      │ API Routes
┌─────────────────────▼───────────────────────────────────────┐
│                    Core Library                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Search Engine + Adapter Registry           │   │
│  └───────┬─────────┬─────────┬─────────┬───────────────┘   │
│          │         │         │         │                    │
│  ┌───────▼──┐ ┌────▼────┐ ┌──▼───┐ ┌───▼────┐              │
│  │Monotaro  │ │ Misumi  │ │Amazon│ │保守部品│  ...         │
│  │ Adapter  │ │ Adapter │ │Adapt.│ │Adapter │              │
│  └──────────┘ └─────────┘ └──────┘ └────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## プロジェクト構造

```
parts-search/
├── packages/
│   ├── core/                      # コアライブラリ
│   │   └── src/
│   │       ├── index.ts
│   │       ├── search-engine.ts   # 検索エンジン
│   │       ├── adapter-registry.ts
│   │       └── types/
│   │           ├── product.ts     # 統一部品型
│   │           ├── search.ts      # 検索クエリ型
│   │           └── adapter.ts     # アダプターIF
│   │
│   ├── adapters/                  # サイトアダプター
│   │   ├── monotaro/              # モノタロウ
│   │   ├── misumi/                # ミスミ
│   │   ├── amazon/                # Amazon
│   │   ├── hobuhin/               # 保守部品.com
│   │   ├── askul/                 # ASKUL
│   │   ├── axel/                  # AXEL
│   │   └── aperza/                # アペルザ
│   │
│   └── web/                       # Webアプリ
│       └── src/
│           ├── app/
│           │   ├── layout.tsx
│           │   ├── page.tsx       # 検索ページ
│           │   └── api/
│           │       └── search/
│           │           └── route.ts
│           └── components/
│               ├── SearchBar.tsx
│               ├── ProductCard.tsx
│               ├── ProductTable.tsx
│               ├── SiteFilter.tsx
│               └── SortSelect.tsx
│
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── README.md
```

---

## 実装フェーズ

### Phase 1: プロジェクト基盤
- [ ] pnpm monorepo セットアップ
- [ ] TypeScript設定
- [ ] ESLint/Prettier設定
- [ ] 基本ディレクトリ構造作成

### Phase 2: コアライブラリ
- [ ] 型定義（Product, SearchQuery, SiteAdapter）
- [ ] AdapterRegistry実装
- [ ] SearchEngine実装（並列検索対応）
- [ ] エラーハンドリング・タイムアウト

### Phase 3: アダプター実装（7サイト）
- [ ] 基底アダプタークラス作成
- [ ] モノタロウアダプター
- [ ] ミスミアダプター
- [ ] Amazonアダプター
- [ ] 保守部品.comアダプター
- [ ] ASKULアダプター
- [ ] AXELアダプター
- [ ] アペルザアダプター

### Phase 4: Webアプリ
- [ ] Next.jsプロジェクト作成
- [ ] 検索バーコンポーネント
- [ ] 検索結果表示（カード/テーブル切替）
- [ ] サイトフィルター
- [ ] ソート機能
- [ ] 検索APIエンドポイント
- [ ] ローディング・エラー表示

### Phase 5: テスト・動作確認
- [ ] アダプター単体テスト
- [ ] 統合テスト
- [ ] 手動動作確認

---

## 主要データモデル

### Product（統一部品情報）
```typescript
interface Product {
  id: string;                    // サイト内ID
  source: SiteId;                // 取得元サイト
  url: string;                   // 商品ページURL
  name: string;                  // 商品名
  partNumber?: string;           // 型番
  manufacturer?: string;         // メーカー
  price: {
    amount: number;
    currency: 'JPY';
    taxIncluded: boolean;
    unit?: string;               // "個", "本"等
  };
  availability: {
    status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'unknown';
    leadTime?: string;           // "当日出荷", "3-5日"等
  };
  images: { url: string; alt?: string }[];
  specifications?: { name: string; value: string }[];
  fetchedAt: Date;
}

type SiteId =
  | 'monotaro'
  | 'misumi'
  | 'amazon'
  | 'hobuhin'
  | 'askul'
  | 'axel'
  | 'aperza';
```

### SiteAdapter（アダプターIF）
```typescript
interface SiteAdapter {
  readonly siteId: SiteId;
  readonly siteName: string;
  readonly siteUrl: string;
  readonly logoUrl?: string;

  search(query: SearchQuery): Promise<AdapterSearchResult>;
  getProductDetail?(productId: string): Promise<Product>;
}

interface SearchQuery {
  keyword: string;
  page?: number;
  perPage?: number;
}

interface AdapterSearchResult {
  products: Product[];
  totalCount: number;
  hasMore: boolean;
}
```

---

## 技術スタック

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| 言語 | TypeScript 5.x | 全体 |
| パッケージ管理 | pnpm | monorepo管理 |
| フロントエンド | Next.js 14 | WebアプリFW |
| スタイリング | Tailwind CSS | CSS |
| UIコンポーネント | shadcn/ui | 再利用可能UI |
| HTTPクライアント | fetch | APIリクエスト |
| HTMLパーサー | cheerio | スクレイピング |
| バリデーション | zod | スキーマ検証 |
| テスト | vitest | ユニットテスト |

---

## 検証方法

### 手動確認項目
1. 検索バーに「ボルト M8」と入力して検索
2. 7サイトの検索結果が表示されることを確認
3. 各商品の価格・在庫情報が表示されることを確認
4. サイトフィルターで絞り込みができることを確認
5. 商品リンクをクリックして元サイトに遷移できることを確認

### 自動テスト
- 各アダプターのパース処理
- SearchEngineの並列検索処理
- エラー時のフォールバック動作

---

## 技術的考慮事項

### スクレイピング
- robots.txt遵守
- リクエスト間隔: 1-2秒/リクエスト
- User-Agent設定
- 構造変更検知（セレクタ失敗時のログ）

### パフォーマンス
- 7サイト並列リクエスト
- タイムアウト: 15秒/サイト
- 部分的成功の表示（一部サイト失敗でも結果表示）

### 拡張性
- 新サイト追加: アダプター1ファイル追加のみ
- アダプター登録: 自動検出または設定ファイル

---

## 次のアクション

計画承認後、Phase 1（プロジェクト基盤）から実装を開始します。
