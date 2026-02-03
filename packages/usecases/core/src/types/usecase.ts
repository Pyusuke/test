import { z } from 'zod';

/**
 * カテゴリID
 */
export const CategoryIdSchema = z.enum([
  'code-generation',      // コード生成
  'code-review',          // コードレビュー
  'debugging',            // デバッグ・トラブルシューティング
  'documentation',        // ドキュメント作成
  'testing',              // テスト作成
  'refactoring',          // リファクタリング
  'architecture',         // 設計・アーキテクチャ
  'learning',             // 学習・スキルアップ
  'automation',           // 自動化・効率化
  'data-analysis',        // データ分析
  'devops',               // DevOps・インフラ
  'other',                // その他
]);

export type CategoryId = z.infer<typeof CategoryIdSchema>;

/**
 * ソースタイプ
 */
export const SourceTypeSchema = z.enum([
  'github',
  'twitter',
  'qiita',
  'zenn',
  'rss',
  'manual',
]);

export type SourceType = z.infer<typeof SourceTypeSchema>;

/**
 * 難易度
 */
export const DifficultySchema = z.enum([
  'beginner',     // 初心者向け
  'intermediate', // 中級者向け
  'advanced',     // 上級者向け
]);

export type Difficulty = z.infer<typeof DifficultySchema>;

/**
 * ステータス
 */
export const StatusSchema = z.enum([
  'draft',      // 下書き
  'review',     // レビュー待ち
  'published',  // 公開済み
  'archived',   // アーカイブ
]);

export type Status = z.infer<typeof StatusSchema>;

/**
 * メトリクススキーマ
 */
export const MetricsSchema = z.object({
  viewCount: z.number().default(0),
  likeCount: z.number().default(0),
  shareCount: z.number().default(0),
  useCount: z.number().default(0),
});

export type Metrics = z.infer<typeof MetricsSchema>;

/**
 * ソース情報スキーマ
 */
export const SourceInfoSchema = z.object({
  type: SourceTypeSchema,
  url: z.string().url().optional(),
  author: z.string().optional(),
  authorUrl: z.string().url().optional(),
  publishedAt: z.coerce.date().optional(),
});

export type SourceInfo = z.infer<typeof SourceInfoSchema>;

/**
 * ビフォーアフタースキーマ
 */
export const BeforeAfterSchema = z.object({
  before: z.string(),
  after: z.string(),
  timeSaved: z.string().optional(),
});

export type BeforeAfter = z.infer<typeof BeforeAfterSchema>;

/**
 * 活用事例スキーマ
 */
export const UseCaseSchema = z.object({
  id: z.string().uuid(),

  // 基本情報
  title: z.string().min(1).max(200),
  summary: z.string().max(500),
  description: z.string(),

  // 分類
  category: CategoryIdSchema,
  tags: z.array(z.string()).max(10),
  difficulty: DifficultySchema,

  // 業務コンテキスト
  industry: z.string().optional(),
  role: z.string().optional(),
  language: z.string().optional(),
  framework: z.string().optional(),

  // Claude Code利用詳細
  promptExample: z.string().optional(),
  outputExample: z.string().optional(),
  beforeAfter: BeforeAfterSchema.optional(),

  // メトリクス
  metrics: MetricsSchema,

  // ソース情報
  source: SourceInfoSchema,

  // メタ情報
  status: StatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  collectedAt: z.coerce.date(),
});

export type UseCase = z.infer<typeof UseCaseSchema>;

/**
 * 作成用スキーマ（IDと日時を除外）
 */
export const CreateUseCaseSchema = UseCaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  collectedAt: true,
  metrics: true,
});

export type CreateUseCase = z.infer<typeof CreateUseCaseSchema>;

/**
 * 更新用スキーマ
 */
export const UpdateUseCaseSchema = CreateUseCaseSchema.partial();

export type UpdateUseCase = z.infer<typeof UpdateUseCaseSchema>;
