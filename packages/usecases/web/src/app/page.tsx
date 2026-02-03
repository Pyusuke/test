'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { UseCaseCard } from '@/components/UseCaseCard';
import type { UseCase, CategoryId } from '@usecases/core/client';

export default function HomePage() {
  const [usecases, setUsecases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>([]);

  useEffect(() => {
    fetchUseCases();
  }, [searchKeyword, selectedCategories]);

  const fetchUseCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchKeyword) params.set('keyword', searchKeyword);
      if (selectedCategories.length > 0) {
        params.set('categories', selectedCategories.join(','));
      }

      const response = await fetch(`/api/usecases?${params}`);
      const data = await response.json();
      setUsecases(data.usecases || []);
    } catch (error) {
      console.error('Failed to fetch usecases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const handleCategoryChange = (categories: CategoryId[]) => {
    setSelectedCategories(categories);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヒーローセクション */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Claude Code 活用事例集
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          業務効率化のためのClaude Code活用方法を検索・発見
        </p>

        {/* 検索バー */}
        <div className="max-w-2xl mx-auto">
          <SearchBar onSearch={handleSearch} placeholder="事例を検索..." />
        </div>
      </section>

      {/* カテゴリフィルター */}
      <section className="mb-8">
        <CategoryFilter
          selectedCategories={selectedCategories}
          onChange={handleCategoryChange}
        />
      </section>

      {/* 事例一覧 */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {searchKeyword || selectedCategories.length > 0
              ? '検索結果'
              : '最新の活用事例'}
          </h2>
          {!loading && (
            <span className="text-gray-500">{usecases.length}件</span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : usecases.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {usecases.map((usecase) => (
              <UseCaseCard key={usecase.id} usecase={usecase} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              該当する事例が見つかりませんでした
            </p>
            <p className="text-gray-400 mt-2">
              別のキーワードやカテゴリで検索してみてください
            </p>
          </div>
        )}
      </section>

      {/* クイックアクション */}
      <section className="mt-16 bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          あなたに合った活用方法を提案
        </h2>
        <p className="text-gray-600 text-center mb-6">
          現在のタスクや使用技術を入力すると、最適な活用事例を提案します
        </p>
        <div className="text-center">
          <a
            href="/suggest"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            提案を受ける
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
