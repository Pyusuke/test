'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { UseCaseCard } from '@/components/UseCaseCard';
import type { UseCase, CategoryId, Difficulty, Facets } from '@usecases/core/client';

export default function UseCasesPage() {
  const [usecases, setUsecases] = useState<UseCase[]>([]);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // フィルター状態
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>('');
  const [sortBy, setSortBy] = useState<'date' | 'popularity'>('date');
  const [page, setPage] = useState(1);
  const perPage = 12;

  useEffect(() => {
    fetchUseCases();
  }, [searchKeyword, selectedCategories, selectedDifficulty, sortBy, page]);

  const fetchUseCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchKeyword) params.set('keyword', searchKeyword);
      if (selectedCategories.length > 0) {
        params.set('categories', selectedCategories.join(','));
      }
      if (selectedDifficulty) {
        params.set('difficulty', selectedDifficulty);
      }
      params.set('sortBy', sortBy);
      params.set('page', page.toString());
      params.set('perPage', perPage.toString());

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      setUsecases(data.usecases || []);
      setFacets(data.facets || null);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error('Failed to fetch usecases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setPage(1);
  };

  const handleCategoryChange = (categories: CategoryId[]) => {
    setSelectedCategories(categories);
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">活用事例一覧</h1>
        <div className="max-w-xl">
          <SearchBar onSearch={handleSearch} placeholder="事例を検索..." />
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* サイドバー */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* カテゴリフィルター */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <CategoryFilter
                selectedCategories={selectedCategories}
                onChange={handleCategoryChange}
              />
            </div>

            {/* 難易度フィルター */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">難易度</h3>
              <div className="space-y-2">
                {[
                  { value: '', label: 'すべて' },
                  { value: 'beginner', label: '初心者向け' },
                  { value: 'intermediate', label: '中級者向け' },
                  { value: 'advanced', label: '上級者向け' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="difficulty"
                      value={option.value}
                      checked={selectedDifficulty === option.value}
                      onChange={(e) => {
                        setSelectedDifficulty(e.target.value as Difficulty | '');
                        setPage(1);
                      }}
                      className="mr-2 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                    {facets && option.value && (
                      <span className="ml-auto text-xs text-gray-400">
                        {facets.difficulties.find((d) => d.id === option.value)?.count || 0}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* 人気タグ */}
            {facets && facets.tags.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">人気のタグ</h3>
                <div className="flex flex-wrap gap-1.5">
                  {facets.tags.slice(0, 10).map((tag) => (
                    <button
                      key={tag.name}
                      onClick={() => handleSearch(tag.name)}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200 transition-colors"
                    >
                      #{tag.name}
                      <span className="ml-1 text-gray-400">{tag.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-grow">
          {/* ツールバー */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-gray-500">
              {loading ? '読み込み中...' : `${totalCount}件の事例`}
            </span>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">並び替え:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'date' | 'popularity');
                  setPage(1);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="date">新着順</option>
                <option value="popularity">人気順</option>
              </select>
            </div>
          </div>

          {/* 事例グリッド */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : usecases.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {usecases.map((usecase) => (
                  <UseCaseCard key={usecase.id} usecase={usecase} />
                ))}
              </div>

              {/* ページネーション */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    前へ
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    次へ
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-lg">該当する事例が見つかりませんでした</p>
              <p className="text-gray-400 mt-2">
                別のキーワードやカテゴリで検索してみてください
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
