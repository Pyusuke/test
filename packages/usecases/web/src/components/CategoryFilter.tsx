'use client';

import { CATEGORIES, type CategoryId } from '@usecases/core/client';

interface CategoryFilterProps {
  selectedCategories: CategoryId[];
  onChange: (categories: CategoryId[]) => void;
}

export function CategoryFilter({
  selectedCategories,
  onChange,
}: CategoryFilterProps) {
  const categories = Object.values(CATEGORIES);

  const toggleCategory = (id: CategoryId) => {
    if (selectedCategories.includes(id)) {
      onChange(selectedCategories.filter((c) => c !== id));
    } else {
      onChange([...selectedCategories, id]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">カテゴリで絞り込み</h3>
        {selectedCategories.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            クリア
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          return (
            <button
              key={category.id}
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
  );
}
