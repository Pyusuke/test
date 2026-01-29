'use client';

import { SITE_SEARCH_URLS, buildSearchUrl, type SiteId } from '@parts-search/core';

interface SiteSearchLinksProps {
  keyword: string;
  selectedSites: SiteId[];
}

export function SiteSearchLinks({ keyword, selectedSites }: SiteSearchLinksProps) {
  if (!keyword.trim()) return null;

  const sites = selectedSites
    .map((siteId) => SITE_SEARCH_URLS[siteId])
    .filter(Boolean);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        各サイトで「{keyword}」を検索
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {sites.map((site) => (
          <a
            key={site.siteId}
            href={buildSearchUrl(site.siteId, keyword)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 hover:shadow-md transition-all text-sm font-medium"
            style={{
              borderColor: site.logoColor,
              color: site.logoColor,
            }}
          >
            <span>{site.name}</span>
            <svg
              className="w-4 h-4"
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
          </a>
        ))}
      </div>
    </div>
  );
}
