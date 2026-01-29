import * as cheerio from 'cheerio';
import type {
  SiteAdapter,
  SiteId,
  Product,
  SearchQuery,
  AdapterSearchResult,
  AdapterConfig,
} from '@parts-search/core';
import { DEFAULT_ADAPTER_CONFIG } from '@parts-search/core';

export abstract class BaseAdapter implements SiteAdapter {
  abstract readonly siteId: SiteId;
  abstract readonly siteName: string;
  abstract readonly siteUrl: string;

  protected config: Required<AdapterConfig>;

  constructor(config?: AdapterConfig) {
    this.config = { ...DEFAULT_ADAPTER_CONFIG, ...config };
  }

  abstract search(query: SearchQuery): Promise<AdapterSearchResult>;

  protected async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
      },
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.text();
  }

  protected parseHtml(html: string): cheerio.CheerioAPI {
    return cheerio.load(html);
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected createProduct(data: Partial<Product> & { id: string; name: string; url: string }): Product {
    return {
      id: data.id,
      source: this.siteId,
      url: data.url,
      name: data.name,
      partNumber: data.partNumber,
      manufacturer: data.manufacturer,
      price: data.price ?? {
        amount: 0,
        currency: 'JPY',
        taxIncluded: true,
      },
      availability: data.availability ?? {
        status: 'unknown',
      },
      images: data.images ?? [],
      specifications: data.specifications,
      fetchedAt: new Date(),
    };
  }

  protected parsePrice(priceText: string): number {
    const cleaned = priceText.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
  }
}

export { cheerio };
