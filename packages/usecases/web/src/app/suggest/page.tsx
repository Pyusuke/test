'use client';

import { useState } from 'react';
import { SuggestionForm } from '@/components/SuggestionForm';
import { SuggestionResult } from '@/components/SuggestionResult';
import type { SuggestionResult as SuggestionResultType } from '@usecases/core/client';

export default function SuggestPage() {
  const [result, setResult] = useState<SuggestionResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (request: {
    currentTask: string;
    language?: string;
    framework?: string;
    categories?: string[];
    difficulty?: string;
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('提案の取得に失敗しました');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <section className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          あなたに合った活用事例を提案
        </h1>
        <p className="text-gray-600">
          現在取り組んでいるタスクや使用技術を入力すると、<br />
          最適なClaude Code活用事例を提案します
        </p>
      </section>

      {/* フォーム */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <SuggestionForm onSubmit={handleSubmit} loading={loading} />
      </section>

      {/* エラー表示 */}
      {error && (
        <section className="mb-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </section>
      )}

      {/* 結果表示 */}
      {result && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            提案された活用事例
          </h2>
          <SuggestionResult
            suggestions={result.suggestions}
            reasoning={result.reasoning}
          />
        </section>
      )}

      {/* 使い方のヒント */}
      {!result && !loading && (
        <section className="bg-gray-50 rounded-xl p-6 mt-8">
          <h3 className="font-bold text-gray-900 mb-4">使い方のヒント</h3>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">1.</span>
              <span>
                <strong>タスクを具体的に</strong>
                記述すると、より関連度の高い事例が提案されます
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">2.</span>
              <span>
                <strong>プログラミング言語やフレームワーク</strong>
                を指定すると、技術スタックに合った事例が優先されます
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">3.</span>
              <span>
                <strong>カテゴリ</strong>
                を選択すると、特定の用途に絞った提案が受けられます
              </span>
            </li>
          </ul>
        </section>
      )}
    </div>
  );
}
