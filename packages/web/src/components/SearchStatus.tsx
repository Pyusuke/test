'use client';

import type { SiteSearchResult } from '@parts-search/core';
import { SITE_INFO, type SiteId } from '@parts-search/core';

interface SearchStatusProps {
  keyword: string;
  totalCount: number;
  siteResults: SiteSearchResult[];
}

export function SearchStatus({ keyword, totalCount, siteResults }: SearchStatusProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="mb-3">
        <span className="text-gray-600">「</span>
        <span className="font-medium text-gray-900">{keyword}</span>
        <span className="text-gray-600">」の検索結果: </span>
        <span className="font-bold text-blue-600">{totalCount}</span>
        <span className="text-gray-600"> 件</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {siteResults.map((result) => {
          const siteInfo = SITE_INFO[result.siteId as SiteId];
          return (
            <div
              key={result.siteId}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
                result.status === 'success'
                  ? 'bg-green-50 text-green-700'
                  : result.status === 'error'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-yellow-50 text-yellow-700'
              }`}
            >
              <span className="font-medium">{siteInfo?.name || result.siteId}</span>
              {result.status === 'success' ? (
                <span>({result.totalCount}件)</span>
              ) : result.status === 'error' ? (
                <span title={result.error}>エラー</span>
              ) : (
                <span>タイムアウト</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
