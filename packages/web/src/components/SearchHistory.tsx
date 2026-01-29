'use client';

interface SearchHistoryProps {
  history: string[];
  onSelect: (term: string) => void;
  onClear: () => void;
}

export function SearchHistory({ history, onSelect, onClear }: SearchHistoryProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">検索履歴</h3>
        <button
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-red-600 transition-colors"
        >
          履歴をクリア
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((term, index) => (
          <button
            key={`${term}-${index}`}
            onClick={() => onSelect(term)}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
