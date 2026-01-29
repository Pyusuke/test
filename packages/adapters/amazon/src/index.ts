import { BaseAdapter } from '@parts-search/adapter-base';
import type { SiteId, SearchQuery, AdapterSearchResult, Product } from '@parts-search/core';

export class AmazonAdapter extends BaseAdapter {
  readonly siteId: SiteId = 'amazon';
  readonly siteName = 'Amazon';
  readonly siteUrl = 'https://www.amazon.co.jp';

  async search(query: SearchQuery): Promise<AdapterSearchResult> {
    const searchUrl = this.buildSearchUrl(query);
    const html = await this.fetchHtml(searchUrl);
    const $ = this.parseHtml(html);

    const products: Product[] = [];

    $('[data-asin]:not([data-asin=""])').each((_, element) => {
      try {
        const $el = $(element);
        const asin = $el.attr('data-asin');
        if (!asin || asin.length < 5) return;

        const product = this.parseProductElement($, $el, asin);
        if (product) {
          products.push(product);
        }
      } catch {
        // Skip invalid items
      }
    });

    const totalText = $('[data-component-type="s-result-info-bar"]').text();
    const totalCount = this.parseTotalCount(totalText);

    return {
      products,
      totalCount,
      hasMore: products.length >= (query.perPage ?? 20),
    };
  }

  private buildSearchUrl(query: SearchQuery): string {
    const params = new URLSearchParams({
      k: query.keyword,
      page: String(query.page ?? 1),
      i: 'industrial', // 産業・研究開発用品カテゴリ
    });
    return `${this.siteUrl}/s?${params.toString()}`;
  }

  private parseProductElement(
    $: ReturnType<typeof this.parseHtml>,
    $el: ReturnType<ReturnType<typeof this.parseHtml>>,
    asin: string
  ): Product | null {
    const nameEl = $el.find('h2 a span, .a-text-normal').first();
    const name = nameEl.text().trim();
    if (!name) return null;

    const linkEl = $el.find('h2 a, a.a-link-normal[href*="/dp/"]').first();
    const href = linkEl.attr('href');
    const url = href
      ? (href.startsWith('http') ? href : `${this.siteUrl}${href}`)
      : `${this.siteUrl}/dp/${asin}`;

    const priceWhole = $el.find('.a-price-whole').first().text();
    const priceFraction = $el.find('.a-price-fraction').first().text();
    const priceText = priceWhole + priceFraction;
    const price = this.parsePrice(priceText);

    const imageUrl = $el.find('img.s-image').first().attr('src');

    const brandEl = $el.find('.a-row .a-size-base-plus, .a-row .a-color-secondary').first();
    const manufacturer = brandEl.text().trim();

    const availabilityText = $el.find('.a-color-price, .a-color-success').first().text().trim();

    return this.createProduct({
      id: asin,
      name,
      url,
      manufacturer: manufacturer || undefined,
      price: {
        amount: price,
        currency: 'JPY',
        taxIncluded: true,
      },
      availability: {
        status: this.parseAvailabilityStatus(availabilityText),
        leadTime: availabilityText || undefined,
      },
      images: imageUrl ? [{ url: imageUrl }] : [],
    });
  }

  private parseTotalCount(text: string): number {
    const match = text.match(/[\d,]+/);
    if (!match) return 0;
    return parseInt(match[0].replace(/,/g, ''), 10);
  }

  private parseAvailabilityStatus(text: string): 'in_stock' | 'out_of_stock' | 'unknown' {
    const lower = text.toLowerCase();
    if (lower.includes('在庫あり') || lower.includes('prime') || lower.includes('明日届く')) {
      return 'in_stock';
    }
    if (lower.includes('在庫切れ') || lower.includes('入荷待ち')) {
      return 'out_of_stock';
    }
    return 'unknown';
  }
}

export default AmazonAdapter;
