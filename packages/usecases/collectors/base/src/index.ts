import type {
  UseCaseCollector,
  CollectorConfig,
  CollectorResult,
  CreateUseCase,
  SourceType,
  CategoryId,
  Difficulty,
} from '@usecases/core';
import { DEFAULT_COLLECTOR_CONFIG } from '@usecases/core';

/**
 * カテゴリ推定用キーワードマップ
 */
const CATEGORY_KEYWORDS: Record<string, CategoryId> = {
  // コード生成
  '生成': 'code-generation',
  'generate': 'code-generation',
  'create': 'code-generation',
  '作成': 'code-generation',
  'ボイラープレート': 'code-generation',
  'scaffold': 'code-generation',

  // コードレビュー
  'レビュー': 'code-review',
  'review': 'code-review',
  'チェック': 'code-review',
  '品質': 'code-review',

  // デバッグ
  'デバッグ': 'debugging',
  'debug': 'debugging',
  'バグ': 'debugging',
  'エラー': 'debugging',
  'fix': 'debugging',
  '修正': 'debugging',

  // ドキュメント
  'ドキュメント': 'documentation',
  'readme': 'documentation',
  'コメント': 'documentation',
  'doc': 'documentation',

  // テスト
  'テスト': 'testing',
  'test': 'testing',
  'spec': 'testing',
  'jest': 'testing',
  'vitest': 'testing',

  // リファクタリング
  'リファクタ': 'refactoring',
  'refactor': 'refactoring',
  '改善': 'refactoring',
  '最適化': 'refactoring',

  // 設計
  '設計': 'architecture',
  'アーキテクチャ': 'architecture',
  'design': 'architecture',

  // 学習
  '学習': 'learning',
  '勉強': 'learning',
  'learn': 'learning',
  '理解': 'learning',

  // 自動化
  '自動化': 'automation',
  'automation': 'automation',
  'スクリプト': 'automation',

  // データ分析
  'データ': 'data-analysis',
  'data': 'data-analysis',
  '分析': 'data-analysis',
  'analysis': 'data-analysis',

  // DevOps
  'ci': 'devops',
  'cd': 'devops',
  'deploy': 'devops',
  'docker': 'devops',
  'kubernetes': 'devops',
};

/**
 * 基底コレクタークラス
 */
export abstract class BaseCollector implements UseCaseCollector {
  abstract readonly sourceType: SourceType;
  abstract readonly sourceName: string;

  protected config: Required<CollectorConfig>;

  constructor(config?: CollectorConfig) {
    this.config = { ...DEFAULT_COLLECTOR_CONFIG, ...config };
  }

  /**
   * 収集を実行（サブクラスで実装）
   */
  abstract collect(config?: CollectorConfig): Promise<CollectorResult>;

  /**
   * JSONをフェッチ
   */
  protected async fetchJson<T>(url: string, headers?: Record<string, string>): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Claude-Code-UseCase-Collector/1.0',
        ...headers,
      },
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * HTMLをフェッチ
   */
  protected async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html',
        'User-Agent': 'Claude-Code-UseCase-Collector/1.0',
      },
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.text();
  }

  /**
   * Claude Code関連のテキストかどうか判定
   */
  protected isClaudeCodeRelated(text: string): boolean {
    const keywords = [
      'claude code',
      'claude-code',
      'claudecode',
      'claude ai',
      '@anthropic',
      'anthropic claude',
      'claude 3',
      'claude opus',
      'claude sonnet',
    ];
    const lowerText = text.toLowerCase();
    return keywords.some(kw => lowerText.includes(kw));
  }

  /**
   * テキストからカテゴリを推定
   */
  protected inferCategory(text: string): CategoryId {
    const lowerText = text.toLowerCase();

    for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return category;
      }
    }

    return 'other';
  }

  /**
   * テキストから難易度を推定
   */
  protected inferDifficulty(text: string): Difficulty {
    const lowerText = text.toLowerCase();

    // 上級者向けキーワード
    if (
      lowerText.includes('advanced') ||
      lowerText.includes('上級') ||
      lowerText.includes('複雑') ||
      lowerText.includes('高度')
    ) {
      return 'advanced';
    }

    // 初心者向けキーワード
    if (
      lowerText.includes('beginner') ||
      lowerText.includes('初心者') ||
      lowerText.includes('入門') ||
      lowerText.includes('基本')
    ) {
      return 'beginner';
    }

    return 'intermediate';
  }

  /**
   * テキストからタグを抽出
   */
  protected extractTags(text: string): string[] {
    const tags: string[] = [];

    // ハッシュタグを抽出
    const hashTags = text.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g) || [];
    tags.push(...hashTags.map(t => t.slice(1)));

    // プログラミング言語を検出
    const languages = [
      'typescript',
      'javascript',
      'python',
      'rust',
      'go',
      'java',
      'ruby',
      'php',
      'swift',
      'kotlin',
    ];
    for (const lang of languages) {
      if (text.toLowerCase().includes(lang)) {
        tags.push(lang);
      }
    }

    // フレームワークを検出
    const frameworks = [
      'react',
      'vue',
      'angular',
      'next.js',
      'nuxt',
      'express',
      'fastapi',
      'django',
      'rails',
    ];
    for (const fw of frameworks) {
      if (text.toLowerCase().includes(fw)) {
        tags.push(fw);
      }
    }

    // 重複を除去して最大10件
    return [...new Set(tags)].slice(0, 10);
  }

  /**
   * テキストからプログラミング言語を検出
   */
  protected detectLanguage(text: string): string | undefined {
    const languages: Record<string, string[]> = {
      TypeScript: ['typescript', 'ts', '.ts'],
      JavaScript: ['javascript', 'js', '.js'],
      Python: ['python', 'py', '.py'],
      Rust: ['rust', '.rs'],
      Go: ['golang', 'go', '.go'],
      Java: ['java', '.java'],
      Ruby: ['ruby', 'rb', '.rb'],
      PHP: ['php', '.php'],
      Swift: ['swift', '.swift'],
      Kotlin: ['kotlin', '.kt'],
    };

    const lowerText = text.toLowerCase();
    for (const [name, keywords] of Object.entries(languages)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        return name;
      }
    }

    return undefined;
  }

  /**
   * テキストからフレームワークを検出
   */
  protected detectFramework(text: string): string | undefined {
    const frameworks: Record<string, string[]> = {
      React: ['react', 'reactjs'],
      Vue: ['vue', 'vuejs'],
      Angular: ['angular'],
      'Next.js': ['next.js', 'nextjs'],
      Nuxt: ['nuxt', 'nuxtjs'],
      Express: ['express', 'expressjs'],
      FastAPI: ['fastapi'],
      Django: ['django'],
      Rails: ['rails', 'ruby on rails'],
      Spring: ['spring', 'springboot'],
    };

    const lowerText = text.toLowerCase();
    for (const [name, keywords] of Object.entries(frameworks)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        return name;
      }
    }

    return undefined;
  }

  /**
   * 重複を除去
   */
  protected deduplicateUseCases(usecases: CreateUseCase[]): CreateUseCase[] {
    const seen = new Set<string>();
    return usecases.filter(uc => {
      const key = uc.source.url || uc.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * テキストを切り詰め
   */
  protected truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  }
}
