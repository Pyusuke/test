import type {
  UseCaseCollector,
  CollectorConfig,
  CollectorResult,
  SourceType,
} from './types';

/**
 * 全コレクターの収集結果
 */
export interface CollectAllResult {
  results: Map<SourceType, CollectorResult>;
  totalUseCases: number;
  totalErrors: number;
  executionTimeMs: number;
}

/**
 * コレクターレジストリ
 * 複数のコレクターを管理し、一括収集を行う
 */
export class CollectorRegistry {
  private collectors: Map<SourceType, UseCaseCollector> = new Map();

  /**
   * コレクターを登録
   */
  register(collector: UseCaseCollector): void {
    this.collectors.set(collector.sourceType, collector);
  }

  /**
   * コレクターを取得
   */
  get(sourceType: SourceType): UseCaseCollector | undefined {
    return this.collectors.get(sourceType);
  }

  /**
   * 登録済みコレクター一覧を取得
   */
  getAll(): UseCaseCollector[] {
    return Array.from(this.collectors.values());
  }

  /**
   * 登録済みソースタイプ一覧を取得
   */
  getSourceTypes(): SourceType[] {
    return Array.from(this.collectors.keys());
  }

  /**
   * 全コレクターで収集を実行
   */
  async collectAll(config?: CollectorConfig): Promise<CollectAllResult> {
    const startTime = Date.now();
    const results = new Map<SourceType, CollectorResult>();
    let totalUseCases = 0;
    let totalErrors = 0;

    // 並列実行
    const promises = Array.from(this.collectors.entries()).map(
      async ([sourceType, collector]) => {
        try {
          const result = await collector.collect(config);
          results.set(sourceType, result);
          totalUseCases += result.usecases.length;
          totalErrors += result.errors.length;
        } catch (error) {
          const errorResult: CollectorResult = {
            usecases: [],
            totalFound: 0,
            errors: [error instanceof Error ? error.message : 'Unknown error'],
            executionTimeMs: 0,
          };
          results.set(sourceType, errorResult);
          totalErrors += 1;
        }
      }
    );

    await Promise.all(promises);

    return {
      results,
      totalUseCases,
      totalErrors,
      executionTimeMs: Date.now() - startTime,
    };
  }

  /**
   * 特定のコレクターで収集を実行
   */
  async collectFrom(
    sourceType: SourceType,
    config?: CollectorConfig
  ): Promise<CollectorResult> {
    const collector = this.collectors.get(sourceType);
    if (!collector) {
      return {
        usecases: [],
        totalFound: 0,
        errors: [`Collector not found: ${sourceType}`],
        executionTimeMs: 0,
      };
    }

    return collector.collect(config);
  }
}
