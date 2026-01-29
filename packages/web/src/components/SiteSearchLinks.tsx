'use client';

import { SITE_SEARCH_URLS, buildSearchUrl } from '@parts-search/core';
import type { SiteId } from '@parts-search/core';

interface SiteSearchLinksProps {
  keyword: string;
  selectedSites: SiteId[];
}

const SITE_DESCRIPTIONS: Record<SiteId, string> = {
  monotaro: '工業用品・工具の総合通販',
  misumi: '機械部品・FA部品専門',
  amazon: '総合EC・幅広い品揃え',
  hobuhin: '保守・メンテナンス部品',
  askul: 'オフィス・現場用品',
  axel: '研究・実験用品（アズワン）',
  aperza: '製造業向けマーケット',
};

export function SiteSearchLinks({ keyword, selectedSites }: SiteSearchLinksProps) {
  if (!keyword.trim()) return null;

  const sites = selectedSites
    .map((siteId) => SITE_SEARCH_URLS[siteId])
    .filter(Boolean);

  const handleOpenAll = () => {
    sites.forEach((site) => {
      window.open(buildSearchUrl(site.siteId, keyword), '_blank');
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b flex items-center justify-between">
        <h3 className="font-medium text-gray-800">
          「<span className="text-blue-600">{keyword}</span>」を各サイトで検索
        </h3>
        <button
          onClick={handleOpenAll}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          全サイトで検索
          <span className="bg-blue-500 px-1.5 py-0.5 rounded text-xs">{sites.length}</span>
        </button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {sites.map((site) => (
            <a
              key={site.siteId}
              href={buildSearchUrl(site.siteId, keyword)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 p-3 rounded-lg border-2 hover:shadow-lg transition-all duration-200"
              style={{
                borderColor: `${site.logoColor}40`,
                backgroundColor: `${site.logoColor}08`,
              }}
            >
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: site.logoColor }}
              >
                {site.name.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span
                    className="font-medium text-sm truncate"
                    style={{ color: site.logoColor }}
                  >
                    {site.name}
                  </span>
                  <svg
                    className="w-3.5 h-3.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ color: site.logoColor }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {SITE_DESCRIPTIONS[site.siteId as SiteId]}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
