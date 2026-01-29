# 部品検索アプリ

複数のECサイトから部品を横断検索できるWebアプリケーション。

## 対応サイト

- モノタロウ
- ミスミ
- Amazon
- 保守部品.com
- ASKUL
- AXEL
- アペルザ

## 技術スタック

- **言語**: TypeScript
- **フロントエンド**: Next.js 14 (App Router)
- **スタイリング**: Tailwind CSS
- **パッケージ管理**: pnpm (monorepo)

## プロジェクト構造

```
packages/
├── core/           # コアライブラリ（型定義、検索エンジン）
├── adapters/       # サイトアダプター
│   ├── base/       # 基底アダプター
│   ├── monotaro/
│   ├── misumi/
│   ├── amazon/
│   ├── hobuhin/
│   ├── askul/
│   ├── axel/
│   └── aperza/
└── web/            # Webアプリケーション
```

## セットアップ

```bash
# 依存関係のインストール
pnpm install

# 全パッケージのビルド
pnpm build

# 開発サーバーの起動
pnpm dev
```

## 新しいサイトの追加方法

1. `packages/adapters/` に新しいディレクトリを作成
2. `BaseAdapter` を継承してアダプターを実装
3. `packages/web/src/app/api/search/route.ts` にアダプターを登録
4. `packages/core/src/types/product.ts` の `SiteId` に追加

```typescript
// 例: RS Online アダプターの追加
import { BaseAdapter } from '@parts-search/adapter-base';

export class RsOnlineAdapter extends BaseAdapter {
  readonly siteId = 'rs_online';
  readonly siteName = 'RS Online';
  readonly siteUrl = 'https://jp.rs-online.com';

  async search(query: SearchQuery): Promise<AdapterSearchResult> {
    // 検索ロジックを実装
  }
}
```

## ライセンス

MIT
