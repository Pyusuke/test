import { BaseAdapter } from '@parts-search/adapter-base';
import type { SiteId, SearchQuery, AdapterSearchResult, Product } from '@parts-search/core';

export class MisumiAdapter extends BaseAdapter {
  readonly siteId: SiteId = 'misumi';
  readonly siteName = 'ミスミ';
  readonly siteUrl = 'https://jp.misumi-ec.com';

  async search(query: SearchQuery): Promise<AdapterSearchResult> {
    const searchUrl = this.buildSearchUrl(query);
    const html = await this.fetchHtml(searchUrl);
    const $ = this.parseHtml(html);

    const products: Product[] = [];

    $('.product-item, .searchResultItem, [data-product-id]').each((_, element) => {
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

    const totalText = $('.result-count, .searchResultCount').text();
    const totalCount = this.parseTotalCount(totalText);

    return {
      products,
      totalCount,
      hasMore: products.length >= (query.perPage ?? 20),
    };
  }

  private buildSearchUrl(query: SearchQuery): string {
    const params = new URLSearchParams({
      Keyword: query.keyword,
      Page: String(query.page ?? 1),
    });
    return `${this.siteUrl}/vona2/result/?${params.toString()}`;
  }

  private parseProductElement(
    $: ReturnType<typeof this.parseHtml>,
    $el: ReturnType<ReturnType<typeof this.parseHtml>>
  ): Product | null {
    const linkEl = $el.find('a[href*="/vona2/detail/"]').first();
    const href = linkEl.attr('href');

    const id = $el.attr('data-product-id') || this.extractProductId(href || '');
    if (!id) return null;

    const name = $el.find('.product-name, .productName, h3, h4').first().text().trim();
    if (!name) return null;

    const url = href
      ? (href.startsWith('http') ? href : `${this.siteUrl}${href}`)
      : `${this.siteUrl}/vona2/detail/${id}/`;

    const priceText = $el.find('.price, .unitPrice, .product-price').first().text();
    const price = this.parsePrice(priceText);

    const imageUrl = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');

    const manufacturer = $el.find('.brand-name, .brandName, .maker').first().text().trim();

    const partNumber = $el.find('.part-number, .partNumber, .model').first().text().trim();

    const deliveryText = $el.find('.delivery, .leadTime, .ship-date').first().text().trim();

    return this.createProduct({
      id,
      name,
      url,
      partNumber: partNumber || undefined,
      manufacturer: manufacturer || undefined,
      price: {
        amount: price,
        currency: 'JPY',
        taxIncluded: false,
      },
      availability: {
        status: this.parseAvailabilityStatus(deliveryText),
        leadTime: deliveryText || undefined,
      },
      images: imageUrl ? [{ url: imageUrl }] : [],
    });
  }

  private extractProductId(href: string): string | null {
    const match = href.match(/\/detail\/([^\/\?]+)/);
    return match?.[1] ?? null;
  }

  private parseTotalCount(text: string): number {
    const match = text.match(/[\d,]+/);
    if (!match) return 0;
    return parseInt(match[0].replace(/,/g, ''), 10);
  }

  private parseAvailabilityStatus(text: string): 'in_stock' | 'out_of_stock' | 'made_to_order' | 'unknown' {
    const lower = text.toLowerCase();
    if (lower.includes('在庫') || lower.includes('当日') || lower.includes('翌日')) {
      return 'in_stock';
    }
    if (lower.includes('受注生産') || lower.includes('日目')) {
      return 'made_to_order';
    }
    if (lower.includes('欠品') || lower.includes('販売終了')) {
      return 'out_of_stock';
    }
    return 'unknown';
  }
}

export default MisumiAdapter;
