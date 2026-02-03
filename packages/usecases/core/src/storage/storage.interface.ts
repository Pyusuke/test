import type { UseCase, CreateUseCase, UpdateUseCase, Metrics } from '../types';

/**
 * 検索オプション
 */
export interface StorageSearchOptions {
  keyword?: string;
  status?: UseCase['status'];
  categories?: UseCase['category'][];
  tags?: string[];
  difficulty?: UseCase['difficulty'];
  language?: string;
  limit?: number;
  offset?: number;
}

/**
 * ストレージインターフェース
 */
export interface Storage {
  /**
   * 全件取得
   */
  getAll(): Promise<UseCase[]>;

  /**
   * IDで取得
   */
  getById(id: string): Promise<UseCase | null>;

  /**
   * 検索
   */
  search(options: StorageSearchOptions): Promise<UseCase[]>;

  /**
   * 作成
   */
  create(usecase: CreateUseCase): Promise<UseCase>;

  /**
   * 複数作成
   */
  createMany(usecases: CreateUseCase[]): Promise<UseCase[]>;

  /**
   * 更新
   */
  update(id: string, usecase: UpdateUseCase): Promise<UseCase>;

  /**
   * 削除
   */
  delete(id: string): Promise<boolean>;

  /**
   * メトリクスをインクリメント
   */
  incrementMetric(id: string, metric: keyof Metrics): Promise<void>;

  /**
   * 件数取得
   */
  count(status?: UseCase['status']): Promise<number>;
}
