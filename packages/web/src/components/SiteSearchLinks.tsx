'use client';

import { useState, useEffect } from 'react';
import { SITE_SEARCH_URLS, buildSearchUrl } from '@parts-search/core';
import type { SiteId } from '@parts-search/core';

interface SiteSearchLinksProps {
  keyword: string;
  selectedSites: SiteId[];
}

// サイト情報（説明、得意分野、ヒント）
const SITE_INFO: Record<SiteId, { description: string; strength: string; tip: string }> = {
  monotaro: {
    description: '工業用品・工具の総合通販',
    strength: '品揃え豊富・当日出荷',
    tip: '会員登録で割引あり',
  },
  misumi: {
    description: '機械部品・FA部品専門',
    strength: 'CADデータ充実・短納期',
    tip: '型番検索が便利',
  },
  amazon: {
    description: '総合EC・幅広い品揃え',
    strength: 'プライム配送・レビュー',
    tip: '産業用品カテゴリで絞込み',
  },
  hobuhin: {
    description: '保守・メンテナンス部品',
    strength: '希少部品・生産終了品',
    tip: '在庫確認がおすすめ',
  },
  askul: {
    description: 'オフィス・現場用品',
    strength: '法人向け・翌日配送',
    tip: '大量購入で割引',
  },
  axel: {
    description: '研究・実験用品（アズワン）',
    strength: '理化学機器・消耗品',
    tip: 'カタログNo.検索可',
  },
  aperza: {
    description: '製造業向けマーケット',
    strength: 'メーカー横断検索',
    tip: 'カタログDL可能',
  },
};

const FAVORITES_KEY = 'parts-search-favorites';

export function SiteSearchLinks({ keyword, selectedSites }: SiteSearchLinksProps) {
  const [favorites, setFavorites] = useState<SiteId[]>([]);

  // お気に入りをローカルストレージから読み込み
  useEffect(() => {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  // お気に入りを切り替え
  const toggleFavorite = (siteId: SiteId, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavorites = favorites.includes(siteId)
      ? favorites.filter((id) => id !== siteId)
      : [...favorites, siteId];
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  if (!keyword.trim()) return null;

  // サイトを取得し、お気に入りを上に並べる
  const allSites = selectedSites
    .map((siteId) => SITE_SEARCH_URLS[siteId])
    .filter(Boolean);

  const favoriteSites = allSites.filter((site) => favorites.includes(site.siteId as SiteId));
  const otherSites = allSites.filter((site) => !favorites.includes(site.siteId as SiteId));
  const sortedSites = [...favoriteSites, ...otherSites];

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-800">
              「<span className="text-blue-600 font-semibold">{keyword}</span>」を各サイトで検索
            </h3>
            <span className="text-xs text-gray-500">{sortedSites.length}サイト</span>
          </div>
        </div>

        {/* お気に入りがある場合の説明 */}
        {favoriteSites.length > 0 && (
          <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100 text-xs text-yellow-700">
            ★ お気に入りサイトが上部に表示されています
          </div>
        )}

        {/* サイトカード */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sortedSites.map((site) => {
              const siteId = site.siteId as SiteId;
              const info = SITE_INFO[siteId];
              const isFavorite = favorites.includes(siteId);

              return (
                <a
                  key={site.siteId}
                  href={buildSearchUrl(siteId, keyword)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col p-4 rounded-xl border-2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  style={{
                    borderColor: isFavorite ? site.logoColor : `${site.logoColor}40`,
                    backgroundColor: `${site.logoColor}05`,
                  }}
                >
                  {/* お気に入りボタン */}
                  <button
                    onClick={(e) => toggleFavorite(siteId, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/80 transition-colors"
                    title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                  >
                    <svg
                      className={`w-5 h-5 transition-colors ${
                        isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                      }`}
                      fill={isFavorite ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>

                  {/* サイトヘッダー */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md"
                      style={{ backgroundColor: site.logoColor }}
                    >
                      {site.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold text-base"
                          style={{ color: site.logoColor }}
                        >
                          {site.name}
                        </span>
                        <svg
                          className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity"
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
                      <p className="text-xs text-gray-500">{info.description}</p>
                    </div>
                  </div>

                  {/* サイト情報 */}
                  <div className="space-y-2 mt-auto">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${site.logoColor}15`,
                          color: site.logoColor,
                        }}
                      >
                        {info.strength}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {info.tip}
                    </p>
                  </div>

                  {/* ホバー時のアクションヒント */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-1 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: site.logoColor }}
                  />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* 使い方ヒント */}
      <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center gap-6 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="text-base">🖱️</span> カードをクリックで検索
        </span>
        <span className="flex items-center gap-1">
          <span className="text-base">⭐</span> ★でお気に入り登録
        </span>
        <span className="flex items-center gap-1">
          <span className="text-base">📌</span> お気に入りは上部に表示
        </span>
      </div>
    </div>
  );
}
