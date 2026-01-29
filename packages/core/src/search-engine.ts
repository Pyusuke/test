import type { SiteId, Product } from './types/product';
import type { SearchQuery, SearchResult, SiteSearchResult } from './types/search';
import type { SiteAdapter, AdapterConfig } from './types/adapter';
import { DEFAULT_ADAPTER_CONFIG } from './types/adapter';
import { AdapterRegistry } from './adapter-registry';

export interface SearchEngineConfig {
  timeout?: number;
  maxConcurrent?: number;
}

const DEFAULT_CONFIG: Required<SearchEngineConfig> = {
  timeout: 15000,
  maxConcurrent: 10,
};

export class SearchEngine {
  private config: Required<SearchEngineConfig>;

  constructor(
    private registry: AdapterRegistry,
    config?: SearchEngineConfig
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now();
    const adapters = this.getTargetAdapters(query);

    if (adapters.length === 0) {
      return {
        query,
        products: [],
        totalCount: 0,
        siteResults: [],
        executionTimeMs: Date.now() - startTime,
      };
    }

    const siteResults = await this.searchAllSites(adapters, query);
    const products = this.aggregateProducts(siteResults);

    return {
      query,
      products,
      totalCount: products.length,
      siteResults,
      executionTimeMs: Date.now() - startTime,
    };
  }

  private getTargetAdapters(query: SearchQuery): SiteAdapter[] {
    if (query.sites && query.sites.length > 0) {
      return this.registry.getByIds(query.sites);
    }
    return this.registry.getAll();
  }

  private async searchAllSites(
    adapters: SiteAdapter[],
    query: SearchQuery
  ): Promise<SiteSearchResult[]> {
    const promises = adapters.map((adapter) =>
      this.searchSiteWithTimeout(adapter, query)
    );

    return Promise.all(promises);
  }

  private async searchSiteWithTimeout(
    adapter: SiteAdapter,
    query: SearchQuery
  ): Promise<SiteSearchResult> {
    const startTime = Date.now();

    try {
      const result = await Promise.race([
        adapter.search(query),
        this.createTimeout(this.config.timeout),
      ]);

      if (result === 'timeout') {
        return {
          siteId: adapter.siteId,
          siteName: adapter.siteName,
          status: 'timeout',
          products: [],
          totalCount: 0,
          hasMore: false,
          error: `Timeout after ${this.config.timeout}ms`,
          executionTimeMs: Date.now() - startTime,
        };
      }

      return {
        siteId: adapter.siteId,
        siteName: adapter.siteName,
        status: 'success',
        products: result.products,
        totalCount: result.totalCount,
        hasMore: result.hasMore,
        executionTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        siteId: adapter.siteId,
        siteName: adapter.siteName,
        status: 'error',
        products: [],
        totalCount: 0,
        hasMore: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  private createTimeout(ms: number): Promise<'timeout'> {
    return new Promise((resolve) => {
      setTimeout(() => resolve('timeout'), ms);
    });
  }

  private aggregateProducts(siteResults: SiteSearchResult[]): Product[] {
    const products: Product[] = [];

    for (const result of siteResults) {
      if (result.status === 'success') {
        products.push(...result.products);
      }
    }

    return products;
  }

  getRegisteredSites(): SiteId[] {
    return this.registry.listSiteIds();
  }
}
