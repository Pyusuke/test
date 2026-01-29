import { BaseAdapter } from '@parts-search/adapter-base';
import type { SiteId, SearchQuery, AdapterSearchResult, Product } from '@parts-search/core';

export class HobuhinAdapter extends BaseAdapter {
  readonly siteId: SiteId = 'hobuhin';
  readonly siteName = '保守部品.com';
  readonly siteUrl = 'https://www.hobuhin.com';

  async search(query: SearchQuery): Promise<AdapterSearchResult> {
    const searchUrl = this.buildSearchUrl(query);
    const html = await this.fetchHtml(searchUrl);
    const $ = this.parseHtml(html);

    const products: Product[] = [];

    $('.product-item, .item-box, .search-result-item').each((_, element) => {
      try {
        const $el = $(element);
        const product = this.parseProductElement($, $el);
        if (product) {
          products.push(product);
        }
      } catch {
        // Skip invalid items
      }
    });

    const totalText = $('.result-count, .search-count').text();
    const totalCount = this.parseTotalCount(totalText);

    return {
      products,
      totalCount,
      hasMore: products.length >= (query.perPage ?? 20),
    };
  }

  private buildSearchUrl(query: SearchQuery): string {
    const params = new URLSearchParams({
      keyword: query.keyword,
      page: String(query.page ?? 1),
    });
    return `${this.siteUrl}/search?${params.toString()}`;
  }

  private parseProductElement(
    $: ReturnType<typeof this.parseHtml>,
    $el: ReturnType<ReturnType<typeof this.parseHtml>>
  ): Product | null {
    const linkEl = $el.find('a[href*="/product/"], a[href*="/item/"]').first();
    const href = linkEl.attr('href');
    if (!href) return null;

    const id = this.extractProductId(href);
    if (!id) return null;

    const name = $el.find('.product-name, .item-name, h3, h4').first().text().trim();
    if (!name) return null;

    const url = href.startsWith('http') ? href : `${this.siteUrl}${href}`;

    const priceText = $el.find('.price, .item-price').first().text();
    const price = this.parsePrice(priceText);

    const imageUrl = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');

    const manufacturer = $el.find('.maker, .manufacturer, .brand').first().text().trim();

    const partNumber = $el.find('.part-number, .model-number, .item-code').first().text().trim();

    const stockText = $el.find('.stock, .availability').first().text().trim();

    return this.createProduct({
      id,
      name,
      url,
      partNumber: partNumber || undefined,
      manufacturer: manufacturer || undefined,
      price: {
        amount: price,
        currency: 'JPY',
        taxIncluded: true,
      },
      availability: {
        status: this.parseAvailabilityStatus(stockText),
        leadTime: stockText || undefined,
      },
      images: imageUrl ? [{ url: imageUrl }] : [],
    });
  }

  private extractProductId(href: string): string | null {
    const match = href.match(/\/(product|item)\/([^\/\?]+)/);
    return match?.[2] ?? null;
  }

  private parseTotalCount(text: string): number {
    const match = text.match(/[\d,]+/);
    if (!match) return 0;
    return parseInt(match[0].replace(/,/g, ''), 10);
  }

  private parseAvailabilityStatus(text: string): 'in_stock' | 'out_of_stock' | 'unknown' {
    const lower = text.toLowerCase();
    if (lower.includes('在庫あり') || lower.includes('即納') || lower.includes('出荷可')) {
      return 'in_stock';
    }
    if (lower.includes('在庫なし') || lower.includes('欠品') || lower.includes('取寄')) {
      return 'out_of_stock';
    }
    return 'unknown';
  }
}

export default HobuhinAdapter;
