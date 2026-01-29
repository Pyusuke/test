'use client';

import type { SiteId } from '@parts-search/core';
import { SITE_INFO } from '@parts-search/core';

interface SiteFilterProps {
  sites: SiteId[];
  selectedSites: SiteId[];
  onToggle: (siteId: SiteId) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function SiteFilter({
  sites,
  selectedSites,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: SiteFilterProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium text-gray-700">検索サイト</h2>
        <div className="space-x-2">
          <button
            onClick={onSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            すべて選択
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={onDeselectAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            すべて解除
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {sites.map((siteId) => {
          const info = SITE_INFO[siteId];
          const isSelected = selectedSites.includes(siteId);
          return (
            <button
              key={siteId}
              onClick={() => onToggle(siteId)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {info.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
