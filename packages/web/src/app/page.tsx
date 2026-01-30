'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { SiteFilter } from '@/components/SiteFilter';
import { SiteSearchLinks } from '@/components/SiteSearchLinks';
import { SearchHistory } from '@/components/SearchHistory';
import { CategorySearch } from '@/components/CategorySearch';
import type { SiteId } from '@parts-search/core';

const ALL_SITES: SiteId[] = ['monotaro', 'misumi', 'amazon', 'hobuhin', 'askul', 'axel', 'aperza'];
const HISTORY_KEY = 'parts-search-history';
const MAX_HISTORY = 10;

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [selectedSites, setSelectedSites] = useState<SiteId[]>(ALL_SITES);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // 検索履歴をローカルストレージから読み込み
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  // 検索履歴を保存
  const saveToHistory = (term: string) => {
    const newHistory = [term, ...searchHistory.filter((h) => h !== term)].slice(0, MAX_HISTORY);
    setSearchHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const handleSearch = (searchKeyword: string) => {
    if (!searchKeyword.trim()) return;
    setKeyword(searchKeyword);
    setHasSearched(true);
    saveToHistory(searchKeyword);
  };

  const handleHistoryClick = (term: string) => {
    setKeyword(term);
    setHasSearched(true);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(HISTORY_KEY);
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
      <SearchBar onSearch={handleSearch} isLoading={false} />

      <SiteFilter
        sites={ALL_SITES}
        selectedSites={selectedSites}
        onToggle={handleSiteToggle}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
      />

      {/* 各サイトへの検索リンク */}
      {hasSearched && keyword && (
        <SiteSearchLinks keyword={keyword} selectedSites={selectedSites} />
      )}

      {/* 検索前の説明と履歴 */}
      {!hasSearched && (
        <>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">
              部品検索ポータル
            </h2>
            <p className="text-sm text-blue-800 mb-4">
              キーワードを入力すると、7つの部品サイトへの検索リンクが表示されます。
              各リンクをクリックして、サイトごとの検索結果を確認できます。
            </p>
            <div className="flex flex-wrap gap-2">
              {['ボルト M8', 'ベアリング 6200', 'Oリング P10', 'シーケンサ FX'].map((example) => (
                <button
                  key={example}
                  onClick={() => handleSearch(example)}
                  className="px-3 py-1.5 bg-white text-blue-700 text-sm rounded-full border border-blue-300 hover:bg-blue-100 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* カテゴリ検索 */}
          <CategorySearch onSearch={handleSearch} />

          {/* 検索履歴 */}
          {searchHistory.length > 0 && (
            <SearchHistory
              history={searchHistory}
              onSelect={handleHistoryClick}
              onClear={handleClearHistory}
            />
          )}
        </>
      )}

      {/* 検索後のヒント */}
      {hasSearched && keyword && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            各カードをクリックすると、そのサイトの検索結果ページが新しいタブで開きます。
          </p>
        </div>
      )}
    </div>
  );
}
