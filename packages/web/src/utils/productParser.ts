import type { SiteId } from '@parts-search/core';

export interface ProductPreview {
  name: string;
  price: string;
  imageUrl?: string;
  url: string;
}

export function parseProducts(html: string, siteId: SiteId, baseUrl: string): ProductPreview[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const products: ProductPreview[] = [];

  try {
    switch (siteId) {
      case 'amazon': {
        const items = doc.querySelectorAll('[data-asin]:not([data-asin=""])');
        items.forEach((item, i) => {
          if (i >= 3) return;
          const asin = item.getAttribute('data-asin');
          const nameEl = item.querySelector('h2 a span, .a-text-normal');
          const priceEl = item.querySelector('.a-price .a-offscreen, .a-price-whole');
          const imgEl = item.querySelector('img.s-image');

          if (nameEl && asin) {
            products.push({
              name: nameEl.textContent?.trim().slice(0, 50) || '',
              price: priceEl?.textContent?.trim() || '価格を確認',
              imageUrl: imgEl?.getAttribute('src') || undefined,
              url: `https://www.amazon.co.jp/dp/${asin}`,
            });
          }
        });
        break;
      }
      case 'monotaro': {
        const items = doc.querySelectorAll('.product-list-item, [class*="ProductItem"], [class*="product-item"]');
        items.forEach((item, i) => {
          if (i >= 3) return;
          const linkEl = item.querySelector('a[href*="/p/"], a[href*="/g/"]');
          const nameEl = item.querySelector('[class*="name"], [class*="Name"], h3, h4');
          const priceEl = item.querySelector('[class*="price"], [class*="Price"]');
          const imgEl = item.querySelector('img');

          if (linkEl && nameEl) {
            const href = linkEl.getAttribute('href') || '';
            products.push({
              name: nameEl.textContent?.trim().slice(0, 50) || '',
              price: priceEl?.textContent?.trim().replace(/\s+/g, ' ') || '価格を確認',
              imageUrl: imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || undefined,
              url: href.startsWith('http') ? href : `https://www.monotaro.com${href}`,
            });
          }
        });
        break;
      }
      case 'misumi': {
        const items = doc.querySelectorAll('[class*="product"], [class*="Product"], [class*="item"]');
        items.forEach((item, i) => {
          if (i >= 3 || products.length >= 3) return;
          const linkEl = item.querySelector('a[href*="/vona2/detail/"], a[href*="/vona/"]');
          const nameEl = item.querySelector('[class*="name"], [class*="Name"], h3, h4, a');
          const priceEl = item.querySelector('[class*="price"], [class*="Price"]');
          const imgEl = item.querySelector('img');

          if (nameEl && (linkEl || item.querySelector('a'))) {
            const link = linkEl || item.querySelector('a');
            const href = link?.getAttribute('href') || '';
            if (href && nameEl.textContent?.trim()) {
              products.push({
                name: nameEl.textContent.trim().slice(0, 50),
                price: priceEl?.textContent?.trim().replace(/\s+/g, ' ') || '価格を確認',
                imageUrl: imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || undefined,
                url: href.startsWith('http') ? href : `https://jp.misumi-ec.com${href}`,
              });
            }
          }
        });
        break;
      }
      default: {
        // 汎用パーサー
        const items = doc.querySelectorAll('[class*="product"], [class*="item"], [class*="result"]');
        items.forEach((item, i) => {
          if (i >= 3 || products.length >= 3) return;
          const linkEl = item.querySelector('a[href]');
          const nameEl = item.querySelector('h2, h3, h4, [class*="name"], [class*="title"]');
          const priceEl = item.querySelector('[class*="price"]');
          const imgEl = item.querySelector('img');

          if (linkEl && nameEl && nameEl.textContent?.trim()) {
            const href = linkEl.getAttribute('href') || '';
            products.push({
              name: nameEl.textContent.trim().slice(0, 50),
              price: priceEl?.textContent?.trim().replace(/\s+/g, ' ') || '価格を確認',
              imageUrl: imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || undefined,
              url: href.startsWith('http') ? href : `${baseUrl}${href}`,
            });
          }
        });
      }
    }
  } catch (e) {
    console.error(`Parse error for ${siteId}:`, e);
  }

  return products;
}
