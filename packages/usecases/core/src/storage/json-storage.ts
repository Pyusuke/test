import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { randomUUID } from 'crypto';
import type { UseCase, CreateUseCase, UpdateUseCase, Metrics } from '../types';
import type { Storage, StorageSearchOptions } from './storage.interface';

/**
 * JSONファイルベースのストレージ実装
 */
export class JsonStorage implements Storage {
  private dataPath: string;
  private cache: UseCase[] | null = null;

  constructor(dataDir: string = './data') {
    this.dataPath = join(dataDir, 'usecases.json');
  }

  /**
   * データファイルの存在を確認し、なければ作成
   */
  private async ensureDataFile(): Promise<void> {
    const dir = dirname(this.dataPath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    if (!existsSync(this.dataPath)) {
      await writeFile(this.dataPath, '[]', 'utf-8');
    }
  }

  /**
   * 日付文字列をDateオブジェクトに変換するreviver
   */
  private dateReviver(_key: string, value: unknown): unknown {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return new Date(value);
    }
    return value;
  }

  async getAll(): Promise<UseCase[]> {
    if (this.cache) return [...this.cache];

    await this.ensureDataFile();
    const data = await readFile(this.dataPath, 'utf-8');
    const parsed: UseCase[] = JSON.parse(data, this.dateReviver.bind(this));
    this.cache = parsed;
    return [...parsed];
  }

  async getById(id: string): Promise<UseCase | null> {
    const all = await this.getAll();
    return all.find(uc => uc.id === id) ?? null;
  }

  async search(options: StorageSearchOptions): Promise<UseCase[]> {
    let results = await this.getAll();

    // ステータスフィルタ
    if (options.status) {
      results = results.filter(uc => uc.status === options.status);
    }

    // キーワード検索
    if (options.keyword) {
      const kw = options.keyword.toLowerCase();
      results = results.filter(
        uc =>
          uc.title.toLowerCase().includes(kw) ||
          uc.summary.toLowerCase().includes(kw) ||
          uc.description.toLowerCase().includes(kw) ||
          uc.tags.some(t => t.toLowerCase().includes(kw))
      );
    }

    // ページネーション
    const offset = options.offset ?? 0;
    const limit = options.limit ?? results.length;
    results = results.slice(offset, offset + limit);

    return results;
  }

  async create(data: CreateUseCase): Promise<UseCase> {
    const all = await this.getAll();
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

    all.push(usecase);
    await this.save(all);
    return usecase;
  }

  async createMany(usecases: CreateUseCase[]): Promise<UseCase[]> {
    const all = await this.getAll();
    const now = new Date();

    const created: UseCase[] = usecases.map(data => ({
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
    }));

    all.push(...created);
    await this.save(all);
    return created;
  }

  async update(id: string, data: UpdateUseCase): Promise<UseCase> {
    const all = await this.getAll();
    const index = all.findIndex(uc => uc.id === id);
    if (index === -1) {
      throw new Error(`UseCase not found: ${id}`);
    }

    const existing = all[index]!;
    all[index] = {
      ...existing,
      ...data,
      id: existing.id,
      metrics: existing.metrics,
      createdAt: existing.createdAt,
      collectedAt: existing.collectedAt,
      updatedAt: new Date(),
    };

    await this.save(all);
    return all[index]!;
  }

  async delete(id: string): Promise<boolean> {
    const all = await this.getAll();
    const index = all.findIndex(uc => uc.id === id);
    if (index === -1) return false;

    all.splice(index, 1);
    await this.save(all);
    return true;
  }

  async incrementMetric(id: string, metric: keyof Metrics): Promise<void> {
    const all = await this.getAll();
    const usecase = all.find(uc => uc.id === id);
    if (usecase) {
      usecase.metrics[metric]++;
      usecase.updatedAt = new Date();
      await this.save(all);
    }
  }

  async count(status?: UseCase['status']): Promise<number> {
    const all = await this.getAll();
    if (status) {
      return all.filter(uc => uc.status === status).length;
    }
    return all.length;
  }

  /**
   * データを保存
   */
  private async save(data: UseCase[]): Promise<void> {
    await this.ensureDataFile();
    await writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
    this.cache = data;
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.cache = null;
  }
}
