'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { SiteFilter } from '@/components/SiteFilter';
import { ProductCard } from '@/components/ProductCard';
import { SearchStatus } from '@/components/SearchStatus';
import { SiteSearchLinks } from '@/components/SiteSearchLinks';
import type { Product, SiteId, SearchResult, SiteSearchResult } from '@parts-search/core';
import { SAMPLE_PRODUCTS } from '@parts-search/core';

const ALL_SITES: SiteId[] = ['monotaro', 'misumi', 'amazon', 'hobuhin', 'askul', 'axel', 'aperza'];

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [selectedSites, setSelectedSites] = useState<SiteId[]>(ALL_SITES);
  const [products, setProducts] = useState<Product[]>([]);
  const [siteResults, setSiteResults] = useState<SiteSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchKeyword: string) => {
    if (!searchKeyword.trim()) return;

    setKeyword(searchKeyword);
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    // デモモード: サンプルデータから検索
    await new Promise((resolve) => setTimeout(resolve, 500)); // ローディング演出

    const lowerKeyword = searchKeyword.toLowerCase();
    const filteredProducts = SAMPLE_PRODUCTS.filter(
      (p) =>
        selectedSites.includes(p.source) &&
        (p.name.toLowerCase().includes(lowerKeyword) ||
          p.partNumber?.toLowerCase().includes(lowerKeyword) ||
          p.manufacturer?.toLowerCase().includes(lowerKeyword))
    );

    // サイトごとの結果を生成
    const siteResultsMap: SiteSearchResult[] = selectedSites.map((siteId) => {
      const siteProducts = filteredProducts.filter((p) => p.source === siteId);
      return {
        siteId,
        siteName: siteId,
        status: 'success' as const,
        products: siteProducts,
        totalCount: siteProducts.length,
        hasMore: false,
        executionTimeMs: Math.floor(Math.random() * 500) + 100,
      };
    });

    setProducts(filteredProducts);
    setSiteResults(siteResultsMap);
    setIsLoading(false);
  };

  const handleSiteToggle = (siteId: SiteId) => {
    setSelectedSites((prev) =>
      prev.includes(siteId)
        ? prev.filter((id) => id !== siteId)
        : [...prev, siteId]
    );
  };

  const handleSelectAll = () => {
    setSelectedSites(ALL_SITES);
  };

  const handleDeselectAll = () => {
    setSelectedSites([]);
  };

  return (
    <div className="space-y-6">
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      <SiteFilter
        sites={ALL_SITES}
        selectedSites={selectedSites}
        onToggle={handleSiteToggle}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
      />

      {/* 各サイトへの検索リンク */}
      {keyword && (
        <SiteSearchLinks keyword={keyword} selectedSites={selectedSites} />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {hasSearched && !isLoading && (
        <SearchStatus
          keyword={keyword}
          totalCount={products.length}
          siteResults={siteResults}
        />
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product, index) => (
            <ProductCard key={`${product.source}-${product.id}-${index}`} product={product} />
          ))}
        </div>
      )}

      {!isLoading && hasSearched && products.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          サンプルデータに一致する結果がありませんでした。
          <br />
          上の「各サイトで検索」ボタンから実際のサイトで検索できます。
        </div>
      )}

      {/* デモモード説明 */}
      {!hasSearched && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">デモモード</h3>
          <p className="text-sm text-blue-700 mb-3">
            このアプリはデモモードで動作しています。検索するとサンプルデータが表示され、
            各サイトへのリンクボタンから実際のサイトで検索できます。
          </p>
          <p className="text-sm text-blue-700">
            <strong>サンプル検索ワード:</strong> ボルト、ナット、ベアリング、Oリング、ワッシャー、ベルト、シリンダー
          </p>
        </div>
      )}
    </div>
  );
}
