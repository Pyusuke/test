'use client';

import { useState } from 'react';
import type { CategoryId, Difficulty } from '@usecases/core/client';
import { CATEGORIES } from '@usecases/core/client';

interface SuggestionFormProps {
  onSubmit: (request: SuggestionRequest) => void;
  loading?: boolean;
}

interface SuggestionRequest {
  currentTask: string;
  language?: string;
  framework?: string;
  categories?: CategoryId[];
  difficulty?: Difficulty;
}

const LANGUAGES = [
  'TypeScript',
  'JavaScript',
  'Python',
  'Rust',
  'Go',
  'Java',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
];

const FRAMEWORKS = [
  'React',
  'Vue',
  'Angular',
  'Next.js',
  'Nuxt',
  'Express',
  'FastAPI',
  'Django',
  'Rails',
  'Spring',
];

export function SuggestionForm({ onSubmit, loading }: SuggestionFormProps) {
  const [currentTask, setCurrentTask] = useState('');
  const [language, setLanguage] = useState('');
  const [framework, setFramework] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CategoryId[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      currentTask,
      language: language || undefined,
      framework: framework || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      difficulty: difficulty || undefined,
    });
  };

  const toggleCategory = (id: CategoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 現在のタスク */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          現在取り組んでいるタスク・課題
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          value={currentTask}
          onChange={(e) => setCurrentTask(e.target.value)}
          placeholder="例: ユニットテストを書くのが面倒、APIドキュメントを作成したい、レガシーコードをリファクタリングしたい..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          rows={3}
          required
        />
      </div>

      {/* 言語・フレームワーク */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            プログラミング言語
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">指定なし</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            フレームワーク
          </label>
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">指定なし</option>
            {FRAMEWORKS.map((fw) => (
              <option key={fw} value={fw}>
                {fw}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 難易度 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          希望する難易度
        </label>
        <div className="flex space-x-4">
          {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
            <label key={d} className="flex items-center">
              <input
                type="radio"
                name="difficulty"
                value={d}
                checked={difficulty === d}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="mr-2 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                {d === 'beginner' && '初心者向け'}
                {d === 'intermediate' && '中級者向け'}
                {d === 'advanced' && '上級者向け'}
              </span>
            </label>
          ))}
          <label className="flex items-center">
            <input
              type="radio"
              name="difficulty"
              value=""
              checked={difficulty === ''}
              onChange={() => setDifficulty('')}
              className="mr-2 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">指定なし</span>
          </label>
        </div>
      </div>

      {/* カテゴリ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          関連するカテゴリ（複数選択可）
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.values(CATEGORIES).map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={`
                  inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${
                    isSelected
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }
                `}
              >
                <span className="mr-1.5">{category.icon}</span>
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={!currentTask.trim() || loading}
        className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            提案を取得中...
          </>
        ) : (
          '活用事例を提案してもらう'
        )}
      </button>
    </form>
  );
}
