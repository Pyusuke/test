import type { UseCase, CategoryId, Difficulty } from './usecase';

/**
 * 提案リクエスト
 */
export interface SuggestionRequest {
  /** 現在のタスク（自然言語） */
  currentTask?: string;
  /** プログラミング言語 */
  language?: string;
  /** フレームワーク */
  framework?: string;
  /** 業種 */
  industry?: string;
  /** 職種 */
  role?: string;
  /** カテゴリフィルタ */
  categories?: CategoryId[];
  /** 難易度フィルタ */
  difficulty?: Difficulty;
  /** 最大結果数 */
  maxResults?: number;
}

/**
 * 提案された活用事例
 */
export interface SuggestedUseCase {
  /** 活用事例 */
  usecase: UseCase;
  /** 関連度スコア（0-100） */
  relevanceScore: number;
  /** マッチした理由 */
  matchReasons: string[];
}

/**
 * 提案結果
 */
export interface SuggestionResult {
  /** 提案リスト */
  suggestions: SuggestedUseCase[];
  /** 提案理由の説明 */
  reasoning?: string;
}
