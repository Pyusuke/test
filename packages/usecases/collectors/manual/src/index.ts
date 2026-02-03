import { BaseCollector } from '@usecases/collector-base';
import type {
  CollectorConfig,
  CollectorResult,
  CreateUseCase,
  SourceType,
  CategoryId,
  Difficulty,
} from '@usecases/core';

/**
 * 手動入力用のデータ
 */
export interface ManualUseCaseInput {
  title: string;
  summary: string;
  description: string;
  category: CategoryId;
  tags?: string[];
  difficulty?: Difficulty;
  industry?: string;
  role?: string;
  language?: string;
  framework?: string;
  promptExample?: string;
  outputExample?: string;
  beforeAfter?: {
    before: string;
    after: string;
    timeSaved?: string;
  };
  sourceUrl?: string;
  author?: string;
  authorUrl?: string;
}

/**
 * 手動入力用コレクター
 * 手動で追加された活用事例を管理
 */
export class ManualCollector extends BaseCollector {
  readonly sourceType: SourceType = 'manual';
  readonly sourceName = '手動入力';

  private pendingUseCases: CreateUseCase[] = [];

  /**
   * 活用事例を追加
   */
  addUseCase(input: ManualUseCaseInput): void {
    const usecase: CreateUseCase = {
      title: input.title,
      summary: input.summary,
      description: input.description,
      category: input.category,
      tags: input.tags ?? this.extractTags(input.description),
      difficulty: input.difficulty ?? this.inferDifficulty(input.description),
      industry: input.industry,
      role: input.role,
      language: input.language ?? this.detectLanguage(input.description),
      framework: input.framework ?? this.detectFramework(input.description),
      promptExample: input.promptExample,
      outputExample: input.outputExample,
      beforeAfter: input.beforeAfter,
      source: {
        type: 'manual',
        url: input.sourceUrl,
        author: input.author,
        authorUrl: input.authorUrl,
      },
      status: 'review',
    };

    this.pendingUseCases.push(usecase);
  }

  /**
   * 複数の活用事例を追加
   */
  addUseCases(inputs: ManualUseCaseInput[]): void {
    for (const input of inputs) {
      this.addUseCase(input);
    }
  }

  /**
   * 収集（追加された活用事例を返す）
   */
  async collect(_config?: CollectorConfig): Promise<CollectorResult> {
    const startTime = Date.now();

    const usecases = [...this.pendingUseCases];
    this.pendingUseCases = []; // クリア

    return {
      usecases,
      totalFound: usecases.length,
      errors: [],
      executionTimeMs: Date.now() - startTime,
    };
  }

  /**
   * 保留中の活用事例数を取得
   */
  getPendingCount(): number {
    return this.pendingUseCases.length;
  }

  /**
   * 保留中の活用事例をクリア
   */
  clearPending(): void {
    this.pendingUseCases = [];
  }
}

/**
 * サンプルデータを生成
 */
export function createSampleUseCases(): ManualUseCaseInput[] {
  return [
    {
      title: 'Claude Codeでユニットテストを自動生成',
      summary: 'TypeScript関数に対するJestテストをClaude Codeで自動生成する方法',
      description: `## 概要
Claude Codeを使用して、既存のTypeScript関数に対するユニットテストを自動生成します。

## 使用方法
1. テスト対象の関数を含むファイルを開く
2. Claude Codeに「この関数のユニットテストを書いて」と指示
3. 生成されたテストをレビューし、必要に応じて修正

## メリット
- テスト作成時間を大幅に短縮
- エッジケースの網羅
- 一貫したテストスタイル`,
      category: 'testing',
      tags: ['typescript', 'jest', 'unit-test', '自動化'],
      difficulty: 'beginner',
      language: 'TypeScript',
      framework: 'Jest',
      promptExample: 'この関数のユニットテストを書いてください。正常系と異常系のテストケースを含めてください。',
      beforeAfter: {
        before: 'テスト作成に30分',
        after: '5分でテスト完成',
        timeSaved: '25分',
      },
    },
    {
      title: 'APIドキュメントの自動生成',
      summary: 'REST APIのエンドポイントからOpenAPI仕様書を自動生成',
      description: `## 概要
Claude Codeを使用して、既存のREST APIコードからOpenAPI（Swagger）仕様書を自動生成します。

## 使用方法
1. APIルートファイルを読み込ませる
2. 「このAPIのOpenAPI仕様書を生成して」と指示
3. 生成された仕様書をYAML/JSONで出力

## ポイント
- リクエスト/レスポンスのスキーマも自動推定
- 既存のコメントから説明文を生成`,
      category: 'documentation',
      tags: ['openapi', 'swagger', 'api', 'rest'],
      difficulty: 'intermediate',
      language: 'TypeScript',
      framework: 'Express',
    },
    {
      title: 'レガシーコードのリファクタリング支援',
      summary: '古いJavaScriptコードをモダンなTypeScriptに変換',
      description: `## 概要
Claude Codeを使用して、レガシーなJavaScriptコードをTypeScriptに移行し、モダンな書き方にリファクタリングします。

## 手順
1. 対象のJSファイルを選択
2. 「このコードをTypeScriptに変換し、モダンな書き方にリファクタリングして」と指示
3. 型定義の追加と構文の改善を確認

## 変換例
- var → const/let
- コールバック → async/await
- 型注釈の追加
- クラス構文の活用`,
      category: 'refactoring',
      tags: ['typescript', 'javascript', 'legacy', 'modernization'],
      difficulty: 'intermediate',
      language: 'TypeScript',
      beforeAfter: {
        before: 'ES5のレガシーコード',
        after: 'TypeScript + ES2022',
        timeSaved: '数時間→数分',
      },
    },
    {
      title: 'エラーメッセージからバグを特定',
      summary: 'スタックトレースを解析してバグの原因と修正方法を提案',
      description: `## 概要
Claude Codeにエラーメッセージやスタックトレースを渡して、バグの原因を特定し修正方法を提案してもらいます。

## 使用方法
1. エラーメッセージをコピー
2. 関連するコードと一緒にClaude Codeに渡す
3. 原因の説明と修正案を取得

## 効果
- 原因究明の時間を大幅短縮
- 見落としがちな問題も検出`,
      category: 'debugging',
      tags: ['debug', 'error', 'troubleshooting'],
      difficulty: 'beginner',
    },
    {
      title: 'コードレビューの自動化',
      summary: 'プルリクエストのコードを自動レビューしてフィードバックを生成',
      description: `## 概要
Claude Codeを使用して、プルリクエストのコード変更を自動レビューし、改善点やバグの可能性を指摘します。

## チェック項目
- コーディング規約の遵守
- パフォーマンス問題
- セキュリティリスク
- エッジケースの考慮漏れ
- 可読性の改善点

## 使用方法
diff出力をClaude Codeに渡し、レビューを依頼します。`,
      category: 'code-review',
      tags: ['review', 'pull-request', 'quality'],
      difficulty: 'intermediate',
    },
    {
      title: 'SQL クエリの最適化支援',
      summary: '遅いSQLクエリを分析して最適化案を提案',
      description: `## 概要
Claude Codeを使用して、パフォーマンスに問題のあるSQLクエリを分析し、最適化案を提案してもらいます。

## 使用方法
1. 遅いSQLクエリとテーブル構造を共有
2. 実行計画（EXPLAIN）の結果も添付
3. 最適化案とインデックス提案を取得

## 最適化のポイント
- 適切なインデックスの提案
- クエリの書き換え
- N+1問題の検出`,
      category: 'data-analysis',
      tags: ['sql', 'database', 'performance', 'optimization'],
      difficulty: 'intermediate',
      language: 'SQL',
    },
    {
      title: 'Reactコンポーネントの新規作成',
      summary: '要件からReactコンポーネントを自動生成',
      description: `## 概要
Claude Codeに要件を伝えるだけで、Reactコンポーネントを自動生成します。

## 使用方法
1. コンポーネントの要件を説明
2. 使用するライブラリを指定（Tailwind CSS等）
3. 生成されたコードを確認・調整

## 生成例
- フォームコンポーネント
- モーダルダイアログ
- データテーブル
- ナビゲーションメニュー`,
      category: 'code-generation',
      tags: ['react', 'component', 'frontend', 'ui'],
      difficulty: 'beginner',
      language: 'TypeScript',
      framework: 'React',
      promptExample: 'ユーザー登録フォームのReactコンポーネントを作成してください。名前、メール、パスワードのフィールドを含め、バリデーションも実装してください。',
    },
    {
      title: 'CI/CDパイプラインの構築',
      summary: 'GitHub Actionsのワークフローを自動生成',
      description: `## 概要
Claude Codeを使用して、プロジェクトに適したCI/CDパイプラインを構築します。

## 対応内容
- テスト自動実行
- リント・フォーマットチェック
- ビルド・デプロイ
- 環境変数の管理

## 使用方法
プロジェクト構成を説明し、必要なワークフローを依頼します。`,
      category: 'devops',
      tags: ['github-actions', 'ci-cd', 'automation', 'deployment'],
      difficulty: 'intermediate',
      language: 'YAML',
    },
    {
      title: 'コードの説明とドキュメント化',
      summary: '複雑なコードを解説し、コメントやREADMEを生成',
      description: `## 概要
Claude Codeに複雑なコードを読み込ませ、わかりやすい説明やドキュメントを生成します。

## 活用シーン
- 新しいプロジェクトへの参加時
- レガシーコードの理解
- チームメンバーへの共有資料作成

## 生成物
- インラインコメント
- 関数ドキュメント
- README.md
- アーキテクチャ図の説明`,
      category: 'documentation',
      tags: ['documentation', 'readme', 'comment', 'explanation'],
      difficulty: 'beginner',
    },
    {
      title: 'セキュリティ脆弱性のチェック',
      summary: 'コードのセキュリティリスクを検出して修正案を提示',
      description: `## 概要
Claude Codeを使用して、コード内のセキュリティ脆弱性を検出し、修正案を提示します。

## 検出対象
- SQLインジェクション
- XSS（クロスサイトスクリプティング）
- 認証・認可の問題
- 機密情報の漏洩リスク
- 依存関係の脆弱性

## 使用方法
対象コードを共有し、セキュリティレビューを依頼します。`,
      category: 'code-review',
      tags: ['security', 'vulnerability', 'owasp', 'audit'],
      difficulty: 'advanced',
    },
    {
      title: 'APIクライアントの自動生成',
      summary: 'OpenAPI仕様からTypeScript APIクライアントを生成',
      description: `## 概要
OpenAPI（Swagger）仕様書からTypeScriptの型安全なAPIクライアントを自動生成します。

## 生成物
- 型定義ファイル
- APIクライアントクラス
- リクエスト/レスポンスの型
- エラーハンドリング

## メリット
- 型安全なAPI呼び出し
- 自動補完の活用
- ドキュメントとの同期`,
      category: 'code-generation',
      tags: ['openapi', 'typescript', 'api-client', 'codegen'],
      difficulty: 'intermediate',
      language: 'TypeScript',
    },
    {
      title: 'Git コミットメッセージの生成',
      summary: '変更内容から適切なコミットメッセージを自動生成',
      description: `## 概要
Claude Codeを使用して、git diffの内容から適切なコミットメッセージを自動生成します。

## 特徴
- Conventional Commits形式に対応
- 変更内容の要約
- Breaking Changesの検出

## 使用方法
git diffの出力を渡すだけで、適切なコミットメッセージを提案します。`,
      category: 'automation',
      tags: ['git', 'commit', 'conventional-commits', 'automation'],
      difficulty: 'beginner',
      promptExample: 'このdiffから適切なコミットメッセージを生成してください。Conventional Commits形式でお願いします。',
    },
  ];
}
