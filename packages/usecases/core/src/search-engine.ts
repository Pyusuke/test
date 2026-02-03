import type {
  UseCase,
  CategoryId,
  Difficulty,
} from './types';
import type { Storage } from './storage';

/**
 * 検索クエリ
 */
export interface SearchQuery {
  /** キーワード */
  keyword?: string;
  /** カテゴリフィルタ */
  categories?: CategoryId[];
  /** タグフィルタ */
  tags?: string[];
  /** 難易度フィルタ */
  difficulty?: Difficulty;
  /** プログラミング言語 */
  language?: string;
  /** フレームワーク */
  framework?: string;
  /** 業種 */
  industry?: string;
  /** ページ番号（1から開始） */
  page?: number;
  /** 1ページあたりの件数 */
  perPage?: number;
  /** ソート項目 */
  sortBy?: 'relevance' | 'date' | 'popularity';
  /** ソート順 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * ファセット（絞り込み候補）
 */
export interface Facets {
  categories: { id: CategoryId; count: number }[];
  tags: { name: string; count: number }[];
  languages: { name: string; count: number }[];
  difficulties: { id: Difficulty; count: number }[];
}

/**
 * 検索結果
 */
export interface SearchResult {
  /** 検索結果 */
  usecases: UseCase[];
  /** 総件数 */
  totalCount: number;
  /** 現在のページ */
  page: number;
  /** 1ページあたりの件数 */
  perPage: number;
  /** ファセット */
  facets: Facets;
}

/**
 * 活用事例検索エンジン
 */
export class UseCaseSearchEngine {
  constructor(private storage: Storage) {}

  /**
   * 検索を実行
   */
  async search(query: SearchQuery): Promise<SearchResult> {
    const allUseCases = await this.storage.getAll();

    // 公開済みのみ対象
    let filtered = allUseCases.filter(uc => uc.status === 'published');

    // キーワード検索
    if (query.keyword) {
      const kw = query.keyword.toLowerCase();
      filtered = filtered.filter(
        uc =>
          uc.title.toLowerCase().includes(kw) ||
          uc.summary.toLowerCase().includes(kw) ||
          uc.description.toLowerCase().includes(kw) ||
          uc.tags.some(t => t.toLowerCase().includes(kw))
      );
    }

    // カテゴリフィルタ
    if (query.categories?.length) {
      filtered = filtered.filter(uc => query.categories!.includes(uc.category));
    }

    // タグフィルタ
    if (query.tags?.length) {
      filtered = filtered.filter(uc =>
        query.tags!.some(t => uc.tags.includes(t))
      );
    }

    // 難易度フィルタ
    if (query.difficulty) {
      filtered = filtered.filter(uc => uc.difficulty === query.difficulty);
    }

    // 言語フィルタ
    if (query.language) {
      filtered = filtered.filter(uc => uc.language === query.language);
    }

    // フレームワークフィルタ
    if (query.framework) {
      filtered = filtered.filter(uc => uc.framework === query.framework);
    }

    // 業種フィルタ
    if (query.industry) {
      filtered = filtered.filter(uc => uc.industry === query.industry);
    }

    // ファセット計算（フィルタ後）
    const facets = this.calculateFacets(filtered);

    // ソート
    filtered = this.sortResults(filtered, query);

    // 総件数
    const totalCount = filtered.length;

    // ページネーション
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 20;
    const start = (page - 1) * perPage;
    const paged = filtered.slice(start, start + perPage);

    return {
      usecases: paged,
      totalCount,
      page,
      perPage,
      facets,
    };
  }

  /**
   * 結果をソート
   */
  private sortResults(usecases: UseCase[], query: SearchQuery): UseCase[] {
    const sortBy = query.sortBy ?? 'date';
    const order = query.sortOrder ?? 'desc';

    return [...usecases].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'popularity':
          const aScore = a.metrics.viewCount + a.metrics.likeCount * 2 + a.metrics.useCount * 3;
          const bScore = b.metrics.viewCount + b.metrics.likeCount * 2 + b.metrics.useCount * 3;
          comparison = aScore - bScore;
          break;
        case 'relevance':
        default:
          // デフォルトは日付順
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
      }

      return order === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * ファセットを計算
   */
  private calculateFacets(usecases: UseCase[]): Facets {
    const categoryMap = new Map<CategoryId, number>();
    const tagMap = new Map<string, number>();
    const languageMap = new Map<string, number>();
    const difficultyMap = new Map<Difficulty, number>();

    for (const uc of usecases) {
      // カテゴリ
      categoryMap.set(uc.category, (categoryMap.get(uc.category) ?? 0) + 1);

      // タグ
      for (const tag of uc.tags) {
        tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
      }

      // 言語
      if (uc.language) {
        languageMap.set(uc.language, (languageMap.get(uc.language) ?? 0) + 1);
      }

      // 難易度
      difficultyMap.set(uc.difficulty, (difficultyMap.get(uc.difficulty) ?? 0) + 1);
    }

    return {
      categories: Array.from(categoryMap.entries())
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => b.count - a.count),
      tags: Array.from(tagMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20),
      languages: Array.from(languageMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      difficulties: Array.from(difficultyMap.entries())
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  /**
   * 人気のタグを取得
   */
  async getPopularTags(limit: number = 10): Promise<{ name: string; count: number }[]> {
    const allUseCases = await this.storage.getAll();
    const published = allUseCases.filter(uc => uc.status === 'published');

    const tagMap = new Map<string, number>();
    for (const uc of published) {
      for (const tag of uc.tags) {
        tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
      }
    }

    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 関連する活用事例を取得
   */
  async getRelated(usecaseId: string, limit: number = 5): Promise<UseCase[]> {
    const target = await this.storage.getById(usecaseId);
    if (!target) return [];

    const allUseCases = await this.storage.getAll();
    const published = allUseCases.filter(
      uc => uc.status === 'published' && uc.id !== usecaseId
    );

    // スコアリング（同じカテゴリ、タグ共通など）
    const scored = published.map(uc => {
      let score = 0;

      // 同じカテゴリ
      if (uc.category === target.category) score += 30;

      // 共通タグ
      const commonTags = uc.tags.filter(t => target.tags.includes(t));
      score += commonTags.length * 10;

      // 同じ言語
      if (uc.language && uc.language === target.language) score += 15;

      // 同じフレームワーク
      if (uc.framework && uc.framework === target.framework) score += 15;

      return { usecase: uc, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.usecase);
  }
}
