'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { SiteFilter } from '@/components/SiteFilter';
import { ProductCard } from '@/components/ProductCard';
import { SearchStatus } from '@/components/SearchStatus';
import type { Product, SiteId, SearchResult, SiteSearchResult } from '@parts-search/core';
import { SITE_INFO } from '@parts-search/core';

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

    try {
      const params = new URLSearchParams({
        keyword: searchKeyword,
        sites: selectedSites.join(','),
      });

      const response = await fetch(`/api/search?${params}`);

      if (!response.ok) {
        throw new Error('検索に失敗しました');
      }

      const result: SearchResult = await response.json();
      setProducts(result.products);
      setSiteResults(result.siteResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索エラーが発生しました');
      setProducts([]);
      setSiteResults([]);
    } finally {
      setIsLoading(false);
    }
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
          検索結果が見つかりませんでした
        </div>
      )}
    </div>
  );
}
