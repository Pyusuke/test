'use client';

import { useState, useEffect } from 'react';
import { SITE_SEARCH_URLS, buildSearchUrl } from '@parts-search/core';
import type { SiteId, SearchResult, SiteSearchResult } from '@parts-search/core';
import { ProductCard } from './ProductCard';

interface SearchResultsProps {
  keyword: string;
  selectedSites: SiteId[];
}

const SITE_NAMES: Record<SiteId, string> = {
  monotaro: 'モノタロウ',
  misumi: 'ミスミ',
  amazon: 'Amazon',
  hobuhin: '保守部品.com',
  askul: 'ASKUL',
  axel: 'AXEL',
  aperza: 'アペルザ',
};

const SITE_COLORS: Record<SiteId, string> = {
  monotaro: '#E60012',
  misumi: '#0066CC',
  amazon: '#FF9900',
  hobuhin: '#006400',
  askul: '#FF0000',
  axel: '#003399',
  aperza: '#00A0E9',
};

// ローディングスケルトン
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-12 bg-gray-200 rounded" />
      </div>
      <div className="aspect-square mb-3 bg-gray-200 rounded" />
      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
      <div className="h-3 w-2/3 bg-gray-200 rounded mb-2" />
      <div className="h-6 w-1/2 bg-gray-200 rounded" />
    </div>
  );
}

// サイトへのリンクカード（フォールバック用）
function SiteLinkCard({ siteId, keyword, error }: { siteId: SiteId; keyword: string; error?: string }) {
  const siteInfo = SITE_SEARCH_URLS[siteId];
  if (!siteInfo) return null;

  return (
    <a
      href={buildSearchUrl(siteId, keyword)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 hover:shadow-md transition-shadow"
      style={{ borderColor: `${SITE_COLORS[siteId]}40` }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
        style={{ backgroundColor: SITE_COLORS[siteId] }}
      >
        {SITE_NAMES[siteId].slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium" style={{ color: SITE_COLORS[siteId] }}>
            {SITE_NAMES[siteId]}で検索
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1 truncate">{error}</p>
        )}
      </div>
    </a>
  );
}

// サイトごとの結果セクション
function SiteResultSection({
  siteResult,
  keyword
}: {
  siteResult: SiteSearchResult;
  keyword: string;
}) {
  const siteId = siteResult.siteId as SiteId;
  const isSuccess = siteResult.status === 'success' && siteResult.products.length > 0;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ backgroundColor: `${SITE_COLORS[siteId]}10` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: SITE_COLORS[siteId] }}
          >
            {SITE_NAMES[siteId]?.slice(0, 1)}
          </div>
          <span className="font-medium text-gray-800">{siteResult.siteName}</span>
          {isSuccess && (
            <span className="text-sm text-gray-500">({siteResult.products.length}件)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {siteResult.status === 'success' && (
            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">成功</span>
          )}
          {siteResult.status === 'error' && (
            <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded">エラー</span>
          )}
          {siteResult.status === 'timeout' && (
            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">タイムアウト</span>
          )}
          <a
            href={buildSearchUrl(siteId, keyword)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            サイトで見る
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      <div className="p-4">
        {isSuccess ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {siteResult.products.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <SiteLinkCard
            siteId={siteId}
            keyword={keyword}
            error={siteResult.error || (siteResult.status === 'timeout' ? '接続がタイムアウトしました' : undefined)}
          />
        )}
      </div>
    </div>
  );
}

export function SearchResults({ keyword, selectedSites }: SearchResultsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!keyword.trim()) {
      setResult(null);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const sitesParam = selectedSites.join(',');
        const response = await fetch(
          `/api/search?keyword=${encodeURIComponent(keyword)}&sites=${sitesParam}&perPage=10`
        );

        if (!response.ok) {
          throw new Error('検索に失敗しました');
        }

        const data: SearchResult = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '検索中にエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [keyword, selectedSites]);

  if (!keyword.trim()) return null;

  // ローディング状態
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
            <span className="text-gray-700">
              「<span className="text-blue-600 font-medium">{keyword}</span>」を検索中...
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
        <p className="text-sm text-red-600 mt-2">
          各サイトで直接検索してください：
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          {selectedSites.map((siteId) => (
            <SiteLinkCard key={siteId} siteId={siteId} keyword={keyword} />
          ))}
        </div>
      </div>
    );
  }

  // 結果がない場合
  if (!result) return null;

  // 成功した結果と失敗した結果を分ける
  const successResults = result.siteResults.filter(
    (r) => r.status === 'success' && r.products.length > 0
  );
  const failedResults = result.siteResults.filter(
    (r) => r.status !== 'success' || r.products.length === 0
  );

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-medium text-gray-800">
            「<span className="text-blue-600">{keyword}</span>」の検索結果
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>取得時間: {(result.executionTimeMs / 1000).toFixed(2)}秒</span>
            <span>合計: {result.totalCount}件</span>
          </div>
        </div>
      </div>

      {/* 成功した結果 */}
      {successResults.map((siteResult) => (
        <SiteResultSection
          key={siteResult.siteId}
          siteResult={siteResult}
          keyword={keyword}
        />
      ))}

      {/* 失敗した結果（リンクとして表示） */}
      {failedResults.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-gray-50">
            <span className="font-medium text-gray-700">
              取得できなかったサイト（リンクから検索）
            </span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {failedResults.map((siteResult) => (
              <SiteLinkCard
                key={siteResult.siteId}
                siteId={siteResult.siteId as SiteId}
                keyword={keyword}
                error={siteResult.error}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
