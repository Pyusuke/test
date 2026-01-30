'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { SiteFilter } from '@/components/SiteFilter';
import { SiteSearchLinks } from '@/components/SiteSearchLinks';
// SearchResults は将来のAPI連携用に凍結（コード保持）
// import { SearchResults } from '@/components/SearchResults';
import { SearchHistory } from '@/components/SearchHistory';
import { CategorySearch } from '@/components/CategorySearch';
import type { SiteId } from '@parts-search/core';

const ALL_SITES: SiteId[] = ['monotaro', 'misumi', 'amazon', 'hobuhin', 'askul', 'axel', 'aperza'];
const HISTORY_KEY = 'parts-search-history';
const MAX_HISTORY = 10;

// ステップコンポーネント
function Step({ number, title, description, icon }: { number: number; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center p-3">
      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-2">
        {number}
      </div>
      <div className="text-2xl mb-1">{icon}</div>
      <h4 className="font-medium text-gray-800 text-sm">{title}</h4>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );
}

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [selectedSites, setSelectedSites] = useState<SiteId[]>(ALL_SITES);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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

  const handleNewSearch = () => {
    setHasSearched(false);
    setKeyword('');
  };

  return (
    <div className="space-y-6">
      {/* 検索後のナビゲーション */}
      {hasSearched && keyword && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border px-4 py-3">
          <button
            onClick={handleNewSearch}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            新しい検索
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">検索中:</span>
            <span className="font-medium text-gray-800">{keyword}</span>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="ヘルプ"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      )}

      {/* 検索後のヘルプ（折りたたみ） */}
      {hasSearched && showHelp && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            使い方
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• サイトカードをクリックすると、そのサイトの検索結果が新しいタブで開きます</li>
            <li>• ★をクリックしてお気に入りに登録すると、次回から上部に表示されます</li>
            <li>• 上部のチェックボックスで検索するサイトを絞り込めます</li>
          </ul>
        </div>
      )}

      {/* 検索バー（検索後も表示） */}
      {!hasSearched && (
        <SearchBar onSearch={handleSearch} isLoading={false} />
      )}

      {/* サイトフィルター */}
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
          {/* 使い方セクション */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-xl">📖</span> 使い方
              </h3>
            </div>
            <div className="p-4">
              {/* ステップ */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <Step number={1} title="キーワード入力" description="部品名や型番を入力" icon="🔍" />
                <Step number={2} title="サイト選択" description="検索するサイトを選ぶ" icon="☑️" />
                <Step number={3} title="カードクリック" description="各サイトで検索" icon="🖱️" />
                <Step number={4} title="価格比較" description="複数サイトで比較" icon="💰" />
              </div>

              {/* 矢印インジケーター（PC表示用） */}
              <div className="hidden md:flex justify-center items-center gap-4 text-gray-300 text-2xl mb-4">
                <span className="w-16" />
                →
                <span className="w-16" />
                →
                <span className="w-16" />
                →
                <span className="w-16" />
              </div>

              {/* 検索のコツ */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <span>💡</span> 検索のコツ
                </h4>
                <ul className="text-xs text-gray-600 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span><strong>型番で検索</strong>すると正確にヒット（例：6200ZZ、M8×20）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span><strong>スペースで複数キーワード</strong>を組み合わせ（例：ベアリング NSK）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span><strong>メーカー名を追加</strong>すると絞り込み可能</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* アプリ説明 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">
              部品検索ポータル
            </h2>
            <p className="text-sm text-blue-800 mb-4">
              7つの部品サイトをまとめて検索できます。キーワードを入力して、各サイトの検索結果を比較しましょう。
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-blue-600 mr-2">サンプル検索:</span>
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
    </div>
  );
}
