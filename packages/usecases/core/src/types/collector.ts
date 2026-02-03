import type { CreateUseCase, SourceType } from './usecase';

/**
 * コレクター設定
 */
export interface CollectorConfig {
  /** タイムアウト（ミリ秒） */
  timeout?: number;
  /** 最大取得件数 */
  maxItems?: number;
  /** 何日前まで収集するか */
  sinceDays?: number;
}

/**
 * デフォルトコレクター設定
 */
export const DEFAULT_COLLECTOR_CONFIG: Required<CollectorConfig> = {
  timeout: 30000,
  maxItems: 100,
  sinceDays: 30,
};

/**
 * コレクター結果
 */
export interface CollectorResult {
  /** 収集した活用事例 */
  usecases: CreateUseCase[];
  /** 見つかった総数 */
  totalFound: number;
  /** エラーメッセージ */
  errors: string[];
  /** 実行時間（ミリ秒） */
  executionTimeMs: number;
}

/**
 * 活用事例コレクターインターフェース
 */
export interface UseCaseCollector {
  /** ソースタイプ */
  readonly sourceType: SourceType;
  /** ソース名 */
  readonly sourceName: string;

  /**
   * 活用事例を収集
   */
  collect(config?: CollectorConfig): Promise<CollectorResult>;

  /**
   * 特定URLから収集（手動追加用）
   */
  collectFromUrl?(url: string): Promise<CreateUseCase | null>;
}
