import type {
  UseCase,
  SuggestionRequest,
  SuggestionResult,
  SuggestedUseCase,
  CategoryId,
} from './types';
import type { Storage } from './storage';
import { CATEGORIES } from './types';

/**
 * カテゴリ推定用キーワードマップ
 */
const CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
  'code-generation': ['生成', 'generate', 'create', '作成', 'ボイラープレート', 'scaffold', '新規'],
  'code-review': ['レビュー', 'review', 'チェック', '品質', 'lint', '検査'],
  'debugging': ['デバッグ', 'debug', 'バグ', 'エラー', 'fix', '修正', 'トラブル'],
  'documentation': ['ドキュメント', 'readme', 'コメント', '説明', 'doc', 'jsdoc'],
  'testing': ['テスト', 'test', 'spec', 'jest', 'vitest', 'unittest', 'e2e'],
  'refactoring': ['リファクタ', 'refactor', '改善', '最適化', 'clean', '整理'],
  'architecture': ['設計', 'アーキテクチャ', 'design', '構成', 'structure', 'パターン'],
  'learning': ['学習', '勉強', 'learn', '理解', '解説', '教えて', 'わからない'],
  'automation': ['自動化', 'automation', 'スクリプト', 'workflow', '効率'],
  'data-analysis': ['データ', 'data', '分析', 'analysis', '集計', 'csv', 'json'],
  'devops': ['ci', 'cd', 'deploy', 'docker', 'kubernetes', 'インフラ', 'aws'],
  'other': [],
};

/**
 * 活用事例提案エンジン
 */
export class SuggestionEngine {
  constructor(private storage: Storage) {}

  /**
   * 状況に応じた活用事例を提案
   */
  async suggest(request: SuggestionRequest): Promise<SuggestionResult> {
    const allUseCases = await this.storage.getAll();
    const published = allUseCases.filter(uc => uc.status === 'published');

    // スコアリング
    const scored = published.map(uc => this.calculateRelevance(uc, request));

    // スコア順にソート
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // 上位N件を取得
    const maxResults = request.maxResults ?? 5;
    const topResults = scored
      .filter(r => r.relevanceScore > 20)
      .slice(0, maxResults);

    return {
      suggestions: topResults,
      reasoning: this.generateReasoning(request, topResults),
    };
  }

  /**
   * 関連度スコアを計算
   */
  private calculateRelevance(
    usecase: UseCase,
    request: SuggestionRequest
  ): SuggestedUseCase {
    let score = 0;
    const reasons: string[] = [];

    // カテゴリマッチ
    if (request.categories?.includes(usecase.category)) {
      score += 30;
      const categoryName = CATEGORIES[usecase.category].name;
      reasons.push(`カテゴリ「${categoryName}」がマッチ`);
    }

    // 言語マッチ
    if (request.language && usecase.language?.toLowerCase() === request.language.toLowerCase()) {
      score += 25;
      reasons.push(`言語「${request.language}」がマッチ`);
    }

    // フレームワークマッチ
    if (request.framework && usecase.framework?.toLowerCase() === request.framework.toLowerCase()) {
      score += 25;
      reasons.push(`フレームワーク「${request.framework}」がマッチ`);
    }

    // 業種マッチ
    if (request.industry && usecase.industry === request.industry) {
      score += 15;
      reasons.push(`業種「${request.industry}」がマッチ`);
    }

    // 職種マッチ
    if (request.role && usecase.role === request.role) {
      score += 15;
      reasons.push(`職種「${request.role}」がマッチ`);
    }

    // 難易度マッチ
    if (request.difficulty && usecase.difficulty === request.difficulty) {
      score += 10;
      reasons.push(`難易度「${request.difficulty}」がマッチ`);
    }

    // タスク文からのキーワードマッチ
    if (request.currentTask) {
      const taskLower = request.currentTask.toLowerCase();

      // タグマッチ
      const matchedTags = usecase.tags.filter(t =>
        taskLower.includes(t.toLowerCase())
      );
      if (matchedTags.length > 0) {
        score += matchedTags.length * 10;
        reasons.push(`タグ「${matchedTags.join(', ')}」がマッチ`);
      }

      // タイトルの単語マッチ
      const titleWords = usecase.title.toLowerCase().split(/\s+/);
      const matchedWords = titleWords.filter(w => w.length > 2 && taskLower.includes(w));
      if (matchedWords.length > 0) {
        score += matchedWords.length * 5;
        reasons.push('タイトルがタスクと関連');
      }

      // カテゴリキーワードからの推定
      const inferredCategories = this.inferCategoriesFromTask(request.currentTask);
      if (inferredCategories.includes(usecase.category)) {
        score += 20;
        reasons.push('タスク内容からカテゴリを推定');
      }
    }

    // 人気度ボーナス
    const popularity = usecase.metrics.likeCount + usecase.metrics.useCount * 2;
    if (popularity > 10) {
      const bonus = Math.min(popularity, 15);
      score += bonus;
      reasons.push(`${popularity}件の高評価`);
    }

    return {
      usecase,
      relevanceScore: Math.min(score, 100),
      matchReasons: reasons,
    };
  }

  /**
   * タスク文からカテゴリを推定
   */
  private inferCategoriesFromTask(task: string): CategoryId[] {
    const taskLower = task.toLowerCase();
    const matched: CategoryId[] = [];

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => taskLower.includes(kw))) {
        matched.push(category as CategoryId);
      }
    }

    return matched;
  }

  /**
   * 提案理由を生成
   */
  private generateReasoning(
    request: SuggestionRequest,
    results: SuggestedUseCase[]
  ): string {
    if (results.length === 0) {
      return '条件に合う事例が見つかりませんでした。検索条件を変更してみてください。';
    }

    const conditions: string[] = [];
    if (request.currentTask) {
      conditions.push(`タスク「${request.currentTask.slice(0, 30)}${request.currentTask.length > 30 ? '...' : ''}」`);
    }
    if (request.language) conditions.push(`言語: ${request.language}`);
    if (request.framework) conditions.push(`FW: ${request.framework}`);
    if (request.categories?.length) {
      const names = request.categories.map(c => CATEGORIES[c].name).join(', ');
      conditions.push(`カテゴリ: ${names}`);
    }

    if (conditions.length > 0) {
      return `${conditions.join(', ')}に基づいて、関連度の高い${results.length}件の事例を提案しました。`;
    }

    return `${results.length}件の人気の事例を提案しました。`;
  }

  /**
   * 人気の活用事例を取得
   */
  async getPopular(limit: number = 10): Promise<UseCase[]> {
    const allUseCases = await this.storage.getAll();
    const published = allUseCases.filter(uc => uc.status === 'published');

    return published
      .sort((a, b) => {
        const aScore = a.metrics.viewCount + a.metrics.likeCount * 2 + a.metrics.useCount * 3;
        const bScore = b.metrics.viewCount + b.metrics.likeCount * 2 + b.metrics.useCount * 3;
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  /**
   * 最新の活用事例を取得
   */
  async getRecent(limit: number = 10): Promise<UseCase[]> {
    const allUseCases = await this.storage.getAll();
    const published = allUseCases.filter(uc => uc.status === 'published');

    return published
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}
