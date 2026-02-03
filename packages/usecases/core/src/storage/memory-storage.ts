import { randomUUID } from 'crypto';
import type { UseCase, CreateUseCase, UpdateUseCase, Metrics } from '../types';
import type { Storage, StorageSearchOptions } from './storage.interface';

/**
 * メモリ内ストレージ実装
 * Vercelなどのサーバーレス環境向け
 */
export class MemoryStorage implements Storage {
  private data: Map<string, UseCase> = new Map();

  constructor(initialData?: UseCase[]) {
    if (initialData) {
      for (const uc of initialData) {
        this.data.set(uc.id, uc);
      }
    }
  }

  async getAll(): Promise<UseCase[]> {
    return Array.from(this.data.values());
  }

  async getById(id: string): Promise<UseCase | null> {
    return this.data.get(id) ?? null;
  }

  async search(options: StorageSearchOptions): Promise<UseCase[]> {
    let results = await this.getAll();

    // ステータスフィルタ
    if (options.status) {
      results = results.filter((uc) => uc.status === options.status);
    }

    // キーワード検索
    if (options.keyword) {
      const kw = options.keyword.toLowerCase();
      results = results.filter(
        (uc) =>
          uc.title.toLowerCase().includes(kw) ||
          uc.summary.toLowerCase().includes(kw) ||
          uc.description.toLowerCase().includes(kw) ||
          uc.tags.some((t) => t.toLowerCase().includes(kw))
      );
    }

    // カテゴリフィルタ
    if (options.categories && options.categories.length > 0) {
      results = results.filter((uc) => options.categories!.includes(uc.category));
    }

    // タグフィルタ
    if (options.tags && options.tags.length > 0) {
      results = results.filter((uc) =>
        options.tags!.some((t) => uc.tags.includes(t))
      );
    }

    // 難易度フィルタ
    if (options.difficulty) {
      results = results.filter((uc) => uc.difficulty === options.difficulty);
    }

    // 言語フィルタ
    if (options.language) {
      results = results.filter((uc) => uc.language === options.language);
    }

    return results;
  }

  async create(data: CreateUseCase): Promise<UseCase> {
    const now = new Date();
    const usecase: UseCase = {
      ...data,
      id: randomUUID(),
      metrics: {
        viewCount: 0,
        likeCount: 0,
        shareCount: 0,
        useCount: 0,
      },
      createdAt: now,
      updatedAt: now,
      collectedAt: now,
    };

    this.data.set(usecase.id, usecase);
    return usecase;
  }

  async createMany(usecases: CreateUseCase[]): Promise<UseCase[]> {
    const results: UseCase[] = [];
    for (const data of usecases) {
      const usecase = await this.create(data);
      results.push(usecase);
    }
    return results;
  }

  async update(id: string, data: UpdateUseCase): Promise<UseCase> {
    const existing = this.data.get(id);
    if (!existing) {
      throw new Error(`UseCase not found: ${id}`);
    }

    const updated: UseCase = {
      ...existing,
      ...data,
      id: existing.id,
      updatedAt: new Date(),
    };

    this.data.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.data.delete(id);
  }

  async incrementMetric(id: string, metric: keyof Metrics): Promise<void> {
    const usecase = this.data.get(id);
    if (usecase) {
      usecase.metrics[metric]++;
    }
  }

  async count(status?: UseCase['status']): Promise<number> {
    if (status) {
      const filtered = Array.from(this.data.values()).filter((uc) => uc.status === status);
      return filtered.length;
    }
    return this.data.size;
  }

  /**
   * データをクリア
   */
  clear(): void {
    this.data.clear();
  }

  /**
   * 初期データをロード
   */
  loadData(usecases: UseCase[]): void {
    for (const uc of usecases) {
      this.data.set(uc.id, uc);
    }
  }
}
