'use client';

import type { SuggestedUseCase } from '@usecases/core/client';
import { CATEGORIES } from '@usecases/core/client';
import { DifficultyBadge } from './DifficultyBadge';

interface SuggestionResultProps {
  suggestions: SuggestedUseCase[];
  reasoning?: string;
}

export function SuggestionResult({ suggestions, reasoning }: SuggestionResultProps) {
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-gray-500 text-lg">該当する活用事例が見つかりませんでした</p>
        <p className="text-gray-400 mt-2 text-sm">
          別のキーワードやカテゴリで検索してみてください
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 提案理由 */}
      {reasoning && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-blue-700 text-sm">{reasoning}</p>
          </div>
        </div>
      )}

      {/* 提案リスト */}
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => {
          const { usecase, relevanceScore, matchReasons } = suggestion;
          const category = CATEGORIES[usecase.category];

          return (
            <a
              key={usecase.id}
              href={`/usecases/${usecase.id}`}
              className="block bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* ランキング */}
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>

                  {/* コンテンツ */}
                  <div className="flex-grow min-w-0">
                    {/* ヘッダー */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        <span className="mr-1">{category.icon}</span>
                        {category.name}
                      </span>
                      <DifficultyBadge difficulty={usecase.difficulty} />
                      <span className="text-xs text-primary-600 font-medium">
                        関連度 {relevanceScore}%
                      </span>
                    </div>

                    {/* タイトル */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {usecase.title}
                    </h3>

                    {/* 概要 */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {usecase.summary}
                    </p>

                    {/* マッチ理由 */}
                    {matchReasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {matchReasons.map((reason, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs"
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 矢印 */}
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
