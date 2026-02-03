'use client';

import type { UseCase } from '@usecases/core/client';
import { CATEGORIES } from '@usecases/core/client';
import { DifficultyBadge } from './DifficultyBadge';

interface UseCaseCardProps {
  usecase: UseCase;
}

export function UseCaseCard({ usecase }: UseCaseCardProps) {
  const category = CATEGORIES[usecase.category];

  return (
    <a
      href={`/usecases/${usecase.id}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200 overflow-hidden group"
    >
      <div className="p-6">
        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-3">
          <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            <span className="mr-1">{category.icon}</span>
            {category.name}
          </span>
          <DifficultyBadge difficulty={usecase.difficulty} />
        </div>

        {/* タイトル */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {usecase.title}
        </h3>

        {/* 概要 */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {usecase.summary}
        </p>

        {/* タグ */}
        {usecase.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {usecase.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
            {usecase.tags.length > 4 && (
              <span className="px-2 py-0.5 text-gray-400 text-xs">
                +{usecase.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* フッター */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-3">
            {usecase.language && (
              <span className="flex items-center">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                {usecase.language}
              </span>
            )}
            {usecase.framework && (
              <span>{usecase.framework}</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center">
              <svg className="w-3.5 h-3.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {usecase.metrics.viewCount}
            </span>
            <span className="flex items-center">
              <svg className="w-3.5 h-3.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {usecase.metrics.likeCount}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
