import { BaseAdapter } from '@parts-search/adapter-base';
import type { SiteId, SearchQuery, AdapterSearchResult, Product } from '@parts-search/core';

export class AskulAdapter extends BaseAdapter {
  readonly siteId: SiteId = 'askul';
  readonly siteName = 'ASKUL';
  readonly siteUrl = 'https://www.askul.co.jp';

  async search(query: SearchQuery): Promise<AdapterSearchResult> {
    const searchUrl = this.buildSearchUrl(query);
    const html = await this.fetchHtml(searchUrl);
    const $ = this.parseHtml(html);

    const products: Product[] = [];

    $('.searchResultList .item, .productList .product, [data-sku]').each((_, element) => {
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

    const totalText = $('.resultCount, .searchResultCount').text();
    const totalCount = this.parseTotalCount(totalText);

    return {
      products,
      totalCount,
      hasMore: products.length >= (query.perPage ?? 20),
    };
  }

  private buildSearchUrl(query: SearchQuery): string {
    const params = new URLSearchParams({
      searchWord: query.keyword,
      page: String(query.page ?? 1),
    });
    return `${this.siteUrl}/s/?${params.toString()}`;
  }

  private parseProductElement(
    $: ReturnType<typeof this.parseHtml>,
    $el: ReturnType<ReturnType<typeof this.parseHtml>>
  ): Product | null {
    const linkEl = $el.find('a[href*="/p/"], a[href*="/detail/"]').first();
    const href = linkEl.attr('href');

    const id = $el.attr('data-sku') || this.extractProductId(href || '');
    if (!id) return null;

    const name = $el.find('.productName, .name, h3').first().text().trim();
    if (!name) return null;

    const url = href
      ? (href.startsWith('http') ? href : `${this.siteUrl}${href}`)
      : `${this.siteUrl}/p/${id}/`;

    const priceText = $el.find('.price, .productPrice, .unitPrice').first().text();
    const price = this.parsePrice(priceText);

    const imageUrl = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');

    const manufacturer = $el.find('.maker, .brand, .manufacturer').first().text().trim();

    const partNumber = $el.find('.janCode, .productCode, .sku').first().text().trim();

    const deliveryText = $el.find('.delivery, .shipDate, .leadTime').first().text().trim();

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
        status: this.parseAvailabilityStatus(deliveryText),
        leadTime: deliveryText || undefined,
      },
      images: imageUrl ? [{ url: imageUrl }] : [],
    });
  }

  private extractProductId(href: string): string | null {
    const match = href.match(/\/(p|detail)\/([^\/\?]+)/);
    return match?.[2] ?? null;
  }

  private parseTotalCount(text: string): number {
    const match = text.match(/[\d,]+/);
    if (!match) return 0;
    return parseInt(match[0].replace(/,/g, ''), 10);
  }

  private parseAvailabilityStatus(text: string): 'in_stock' | 'out_of_stock' | 'unknown' {
    const lower = text.toLowerCase();
    if (lower.includes('当日') || lower.includes('翌日') || lower.includes('お届け')) {
      return 'in_stock';
    }
    if (lower.includes('欠品') || lower.includes('在庫なし') || lower.includes('販売終了')) {
      return 'out_of_stock';
    }
    return 'unknown';
  }
}

export default AskulAdapter;
