'use client';

import { useState, useEffect } from 'react';
import { SITE_SEARCH_URLS, buildSearchUrl } from '@parts-search/core';
import type { SiteId } from '@parts-search/core';
import { useSiteProductFetch } from '@/hooks/useSiteProductFetch';
import type { ProductPreview } from '@/utils/productParser';

interface SiteSearchLinksProps {
  keyword: string;
  selectedSites: SiteId[];
}

// サイト情報
const SITE_INFO: Record<SiteId, { description: string; strength: string; tip: string }> = {
  monotaro: {
    description: '工業用品・工具の総合通販',
    strength: '品揃え豊富・当日出荷',
    tip: '会員登録で割引あり',
  },
  misumi: {
    description: '機械部品・FA部品専門',
    strength: 'CADデータ充実・短納期',
    tip: '型番検索が便利',
  },
  amazon: {
    description: '総合EC・幅広い品揃え',
    strength: 'プライム配送・レビュー',
    tip: '産業用品カテゴリで絞込み',
  },
  hobuhin: {
    description: '保守・メンテナンス部品',
    strength: '希少部品・生産終了品',
    tip: '在庫確認がおすすめ',
  },
  askul: {
    description: 'オフィス・現場用品',
    strength: '法人向け・翌日配送',
    tip: '大量購入で割引',
  },
  axel: {
    description: '研究・実験用品（アズワン）',
    strength: '理化学機器・消耗品',
    tip: 'カタログNo.検索可',
  },
  aperza: {
    description: '製造業向けマーケット',
    strength: 'メーカー横断検索',
    tip: 'カタログDL可能',
  },
};

const FAVORITES_KEY = 'parts-search-favorites';

// 商品プレビューカード
function ProductPreviewCard({ product }: { product: ProductPreview }) {
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-2 bg-white rounded border hover:shadow-md transition-shadow"
    >
      {product.imageUrl && (
        <div className="w-full h-16 mb-1 flex items-center justify-center bg-gray-50 rounded overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <p className="text-xs text-gray-700 line-clamp-2 mb-1">{product.name}</p>
      <p className="text-xs font-bold text-blue-600">{product.price}</p>
    </a>
  );
}

// ローディングスケルトン
function ProductSkeleton() {
  return (
    <div className="p-2 bg-white rounded border animate-pulse">
      <div className="w-full h-16 mb-1 bg-gray-200 rounded" />
      <div className="h-3 bg-gray-200 rounded mb-1" />
      <div className="h-3 w-1/2 bg-gray-200 rounded" />
    </div>
  );
}

export function SiteSearchLinks({ keyword, selectedSites }: SiteSearchLinksProps) {
  const [favorites, setFavorites] = useState<SiteId[]>([]);

  // 新しいフックを使用（順次取得+一括表示）
  const { results, isLoading, completedCount, totalCount } = useSiteProductFetch({
    keyword,
    selectedSites,
    batchMode: true,
  });

  // お気に入りをローカルストレージから読み込み
  useEffect(() => {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  // お気に入りを切り替え
  const toggleFavorite = (siteId: SiteId, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavorites = favorites.includes(siteId)
      ? favorites.filter((id) => id !== siteId)
      : [...favorites, siteId];
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  if (!keyword.trim()) return null;

  // サイトを取得し、お気に入りを上に並べる
  const allSites = selectedSites
    .map((siteId) => SITE_SEARCH_URLS[siteId])
    .filter(Boolean);

  const favoriteSites = allSites.filter((site) => favorites.includes(site.siteId as SiteId));
  const otherSites = allSites.filter((site) => !favorites.includes(site.siteId as SiteId));
  const sortedSites = [...favoriteSites, ...otherSites];

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-800">
              「<span className="text-blue-600 font-semibold">{keyword}</span>」の検索結果
            </h3>
            <div className="flex items-center gap-2">
              {isLoading && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full animate-pulse">
                  取得中 {completedCount}/{totalCount}
                </span>
              )}
              <span className="text-xs text-gray-500">{sortedSites.length}サイト</span>
            </div>
          </div>
        </div>

        {/* お気に入りがある場合の説明 */}
        {favoriteSites.length > 0 && (
          <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100 text-xs text-yellow-700">
            ★ お気に入りサイトが上部に表示されています
          </div>
        )}

        {/* サイトカード */}
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sortedSites.map((site) => {
              const siteId = site.siteId as SiteId;
              const info = SITE_INFO[siteId];
              const isFavorite = favorites.includes(siteId);
              const result = results[siteId];
              const status = result?.status;
              const isLoadingOrPending = status === 'loading' || status === 'pending';
              const hasProducts = status === 'success' && result && result.products.length > 0;
              const isSkipped = status === 'skipped';

              return (
                <div
                  key={site.siteId}
                  className="relative rounded-xl border-2 overflow-hidden"
                  style={{
                    borderColor: isFavorite ? site.logoColor : `${site.logoColor}40`,
                    backgroundColor: `${site.logoColor}05`,
                  }}
                >
                  {/* お気に入りボタン */}
                  <button
                    onClick={(e) => toggleFavorite(siteId, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/80 transition-colors z-10"
                    title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                  >
                    <svg
                      className={`w-5 h-5 transition-colors ${
                        isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                      }`}
                      fill={isFavorite ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>

                  {/* サイトヘッダー */}
                  <div className="p-3 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0"
                      style={{ backgroundColor: site.logoColor }}
                    >
                      {site.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: site.logoColor }}>
                          {site.name}
                        </span>
                        {isLoadingOrPending && (
                          <span className="text-xs text-gray-400">取得中...</span>
                        )}
                        {hasProducts && (
                          <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                            {result.products.length}件取得
                          </span>
                        )}
                        {isSkipped && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            リンクのみ
                          </span>
                        )}
                        {status === 'error' && (
                          <span className="text-xs text-gray-400">リンクで検索</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{info.description}</p>
                    </div>
                  </div>

                  {/* 商品プレビュー or リンク */}
                  <div className="px-3 pb-3">
                    {isLoadingOrPending ? (
                      <div className="grid grid-cols-3 gap-2">
                        <ProductSkeleton />
                        <ProductSkeleton />
                        <ProductSkeleton />
                      </div>
                    ) : hasProducts ? (
                      <div className="grid grid-cols-3 gap-2">
                        {result.products.map((product, i) => (
                          <ProductPreviewCard key={i} product={product} />
                        ))}
                      </div>
                    ) : (
                      <a
                        href={buildSearchUrl(siteId, keyword)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-white rounded-lg border text-center hover:shadow-md transition-shadow"
                      >
                        <p className="text-sm text-gray-600 mb-1">
                          {result?.error || 'サイトで検索'}
                        </p>
                        <span
                          className="inline-flex items-center gap-1 text-sm font-medium"
                          style={{ color: site.logoColor }}
                        >
                          {site.name}で検索
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </span>
                      </a>
                    )}

                    {/* もっと見るリンク（商品がある場合） */}
                    {hasProducts && (
                      <a
                        href={buildSearchUrl(siteId, keyword)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center justify-center gap-1 text-xs py-1.5 rounded hover:bg-white/50 transition-colors"
                        style={{ color: site.logoColor }}
                      >
                        もっと見る
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 使い方ヒント */}
      <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center gap-6 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="text-base">🖱️</span> 商品クリックで詳細へ
        </span>
        <span className="flex items-center gap-1">
          <span className="text-base">⭐</span> ★でお気に入り登録
        </span>
        <span className="flex items-center gap-1">
          <span className="text-base">🔗</span> 「もっと見る」で全件表示
        </span>
      </div>
    </div>
  );
}
