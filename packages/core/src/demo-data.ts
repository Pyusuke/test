import type { Product, SiteId } from './types';

export interface SiteLinkInfo {
  siteId: SiteId;
  name: string;
  searchUrl: string;
  logoColor: string;
}

export const SITE_SEARCH_URLS: Record<SiteId, SiteLinkInfo> = {
  monotaro: {
    siteId: 'monotaro',
    name: 'モノタロウ',
    searchUrl: 'https://www.monotaro.com/s/?q={keyword}',
    logoColor: '#E60012',
  },
  misumi: {
    siteId: 'misumi',
    name: 'ミスミ',
    searchUrl: 'https://jp.misumi-ec.com/vona2/result/?Keyword={keyword}',
    logoColor: '#0066CC',
  },
  amazon: {
    siteId: 'amazon',
    name: 'Amazon',
    searchUrl: 'https://www.amazon.co.jp/s?k={keyword}&i=industrial',
    logoColor: '#FF9900',
  },
  hobuhin: {
    siteId: 'hobuhin',
    name: '保守部品.com',
    searchUrl: 'https://hoshubuhin.com/search?search[query]={keyword}&submit.x=0&submit.y=0',
    logoColor: '#006400',
  },
  askul: {
    siteId: 'askul',
    name: 'ASKUL',
    searchUrl: 'https://www.askul.co.jp/ksearch/?searchWord={keyword}&fluxSearch=ON',
    logoColor: '#FF0000',
  },
  axel: {
    siteId: 'axel',
    name: 'AXEL',
    searchUrl: 'https://axel.as-1.co.jp/asone/keyword/?q={keyword}',
    logoColor: '#003399',
  },
  aperza: {
    siteId: 'aperza',
    name: 'アペルザ',
    searchUrl: 'https://www.aperza.com/ja/s/model/?k={keyword}&rf=1102&ss=1',
    logoColor: '#00A0E9',
  },
};

// サイト取得設定
export interface SiteFetchConfig {
  /** 取得を試みるか */
  fetchEnabled: boolean;
  /** パース信頼度 (0-1) */
  parseReliability: number;
  /** タイムアウト(ms) */
  timeout?: number;
  /** 優先順位 (小さい=先に取得) */
  priority: number;
  /** 専用パーサーあり */
  hasDedicatedParser: boolean;
}

export const SITE_FETCH_CONFIG: Record<SiteId, SiteFetchConfig> = {
  amazon: {
    fetchEnabled: true,
    parseReliability: 0.85,
    timeout: 8000,
    priority: 1,
    hasDedicatedParser: true,
  },
  monotaro: {
    fetchEnabled: true,
    parseReliability: 0.75,
    timeout: 8000,
    priority: 2,
    hasDedicatedParser: true,
  },
  misumi: {
    fetchEnabled: true,
    parseReliability: 0.70,
    timeout: 8000,
    priority: 3,
    hasDedicatedParser: true,
  },
  askul: {
    fetchEnabled: true,
    parseReliability: 0.60,
    timeout: 8000,
    priority: 4,
    hasDedicatedParser: false,
  },
  axel: {
    fetchEnabled: true,
    parseReliability: 0.55,
    timeout: 8000,
    priority: 5,
    hasDedicatedParser: false,
  },
  aperza: {
    fetchEnabled: false,
    parseReliability: 0.30,
    priority: 6,
    hasDedicatedParser: false,
  },
  hobuhin: {
    fetchEnabled: false,
    parseReliability: 0.25,
    priority: 7,
    hasDedicatedParser: false,
  },
};

// ヘルパー関数
export function getFetchableSites(siteIds: SiteId[]): SiteId[] {
  return siteIds
    .filter((id) => SITE_FETCH_CONFIG[id].fetchEnabled)
    .sort((a, b) => SITE_FETCH_CONFIG[a].priority - SITE_FETCH_CONFIG[b].priority);
}

export function getNonFetchableSites(siteIds: SiteId[]): SiteId[] {
  return siteIds.filter((id) => !SITE_FETCH_CONFIG[id].fetchEnabled);
}

export function buildSearchUrl(siteId: SiteId, keyword: string): string {
  const site = SITE_SEARCH_URLS[siteId];
  if (!site) return '#';
  return site.searchUrl.replace('{keyword}', encodeURIComponent(keyword));
}

export function getAllSearchUrls(keyword: string): Array<{ site: SiteLinkInfo; url: string }> {
  return Object.values(SITE_SEARCH_URLS).map((site) => ({
    site,
    url: buildSearchUrl(site.siteId, keyword),
  }));
}

// サンプル部品データ
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'sample-1',
    source: 'monotaro',
    url: 'https://www.monotaro.com/s/?q=%E5%85%AD%E8%A7%92%E3%83%9C%E3%83%AB%E3%83%88+M8x20',
    name: '六角ボルト M8×20 ステンレス',
    partNumber: 'M8-20-SUS',
    manufacturer: '各社',
    price: { amount: 15, currency: 'JPY', taxIncluded: false, unit: '本' },
    availability: { status: 'in_stock', leadTime: '当日出荷' },
    images: [],
    fetchedAt: new Date(),
  },
  {
    id: 'sample-2',
    source: 'misumi',
    url: 'https://jp.misumi-ec.com/vona2/result/?Keyword=%E5%85%AD%E8%A7%92%E3%83%8A%E3%83%83%E3%83%88+M8',
    name: '六角ナット M8 スチール',
    partNumber: 'HNTST-M8',
    manufacturer: 'ミスミ',
    price: { amount: 8, currency: 'JPY', taxIncluded: false, unit: '個' },
    availability: { status: 'in_stock', leadTime: '当日出荷' },
    images: [],
    fetchedAt: new Date(),
  },
  {
    id: 'sample-3',
    source: 'amazon',
    url: 'https://www.amazon.co.jp/s?k=%E3%83%99%E3%82%A2%E3%83%AA%E3%83%B3%E3%82%B0+6200',
    name: '深溝玉軸受 ベアリング 6200',
    partNumber: '6200',
    manufacturer: 'NTN/NSK',
    price: { amount: 350, currency: 'JPY', taxIncluded: true, unit: '個' },
    availability: { status: 'in_stock', leadTime: '翌日配送' },
    images: [],
    fetchedAt: new Date(),
  },
  {
    id: 'sample-4',
    source: 'axel',
    url: 'https://axel.as-1.co.jp/asone/s/O%E3%83%AA%E3%83%B3%E3%82%B0+P10/',
    name: 'Oリング P10 ニトリルゴム',
    partNumber: 'P10-NBR',
    manufacturer: 'アズワン',
    price: { amount: 45, currency: 'JPY', taxIncluded: false, unit: '個' },
    availability: { status: 'in_stock', leadTime: '2-3日' },
    images: [],
    fetchedAt: new Date(),
  },
  {
    id: 'sample-5',
    source: 'askul',
    url: 'https://www.askul.co.jp/usf/000073702/%E3%83%AF%E3%83%83%E3%82%B7%E3%83%A3%E3%83%BC+M8/',
    name: '平ワッシャー M8 ステンレス',
    partNumber: 'WS-M8-SUS',
    manufacturer: '各社',
    price: { amount: 5, currency: 'JPY', taxIncluded: false, unit: '枚' },
    availability: { status: 'in_stock', leadTime: '当日出荷' },
    images: [],
    fetchedAt: new Date(),
  },
  {
    id: 'sample-6',
    source: 'hobuhin',
    url: 'https://www.hobuhin.co.jp/products/search?q=%E3%82%BF%E3%82%A4%E3%83%9F%E3%83%B3%E3%82%B0%E3%83%99%E3%83%AB%E3%83%88',
    name: 'タイミングベルト 200-2GT',
    partNumber: '200-2GT-6',
    manufacturer: 'ゲイツ',
    price: { amount: 1200, currency: 'JPY', taxIncluded: false, unit: '本' },
    availability: { status: 'in_stock', leadTime: '3-5日' },
    images: [],
    fetchedAt: new Date(),
  },
  {
    id: 'sample-7',
    source: 'aperza',
    url: 'https://www.aperza.com/catalog/page/1/?q=%E3%82%A8%E3%82%A2%E3%82%B7%E3%83%AA%E3%83%B3%E3%83%80%E3%83%BC',
    name: 'エアシリンダー φ20×50',
    partNumber: 'CDA2-20-50',
    manufacturer: 'SMC',
    price: { amount: 4500, currency: 'JPY', taxIncluded: false, unit: '本' },
    availability: { status: 'in_stock', leadTime: '即納' },
    images: [],
    fetchedAt: new Date(),
  },
];

// キーワードに基づいてサンプルデータをフィルタリング
export function filterSampleProducts(keyword: string): Product[] {
  const lowerKeyword = keyword.toLowerCase();
  return SAMPLE_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerKeyword) ||
      p.partNumber?.toLowerCase().includes(lowerKeyword) ||
      p.manufacturer?.toLowerCase().includes(lowerKeyword)
  );
}
