import type { SiteId, Product } from './product';
import type { SearchQuery } from './search';

export interface AdapterSearchResult {
  products: Product[];
  totalCount: number;
  hasMore: boolean;
}

export interface SiteAdapter {
  readonly siteId: SiteId;
  readonly siteName: string;
  readonly siteUrl: string;

  search(query: SearchQuery): Promise<AdapterSearchResult>;

  getProductDetail?(productId: string): Promise<Product>;
}

export interface AdapterConfig {
  timeout?: number;
  retryCount?: number;
  requestDelay?: number;
}

export const DEFAULT_ADAPTER_CONFIG: Required<AdapterConfig> = {
  timeout: 15000,
  retryCount: 2,
  requestDelay: 1000,
};
