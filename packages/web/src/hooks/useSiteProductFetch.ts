'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  buildSearchUrl,
  SITE_FETCH_CONFIG,
  getFetchableSites,
  getNonFetchableSites,
} from '@parts-search/core';
import type { SiteId } from '@parts-search/core';
import { parseProducts, type ProductPreview } from '@/utils/productParser';

// サイト結果型
export interface SiteResult {
  siteId: SiteId;
  status: 'pending' | 'loading' | 'success' | 'error' | 'skipped';
  products: ProductPreview[];
  error?: string;
}

interface UseSiteProductFetchOptions {
  keyword: string;
  selectedSites: SiteId[];
  /** 順次取得+一括表示モード（デフォルト: true） */
  batchMode?: boolean;
}

interface UseSiteProductFetchResult {
  results: Partial<Record<SiteId, SiteResult>>;
  isLoading: boolean;
  completedCount: number;
  totalCount: number;
}

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const DEFAULT_TIMEOUT = 10000;

// タイムアウト付きfetch
async function fetchWithTimeout(
  url: string,
  signal: AbortSignal,
  timeout: number
): Promise<string> {
  const timeoutId = setTimeout(() => {
    // タイムアウト時にabort
  }, timeout);

  try {
    const response = await fetch(url, {
      headers: { Accept: 'text/html,application/xhtml+xml' },
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

// 単一サイトからデータ取得
async function fetchSite(
  siteId: SiteId,
  keyword: string,
  signal: AbortSignal
): Promise<SiteResult> {
  const config = SITE_FETCH_CONFIG[siteId];
  const searchUrl = buildSearchUrl(siteId, keyword);
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(searchUrl)}`;

  try {
    const html = await fetchWithTimeout(
      proxyUrl,
      signal,
      config.timeout ?? DEFAULT_TIMEOUT
    );

    const baseUrl = new URL(searchUrl).origin;
    const products = parseProducts(html, siteId, baseUrl);

    return {
      siteId,
      status: products.length > 0 ? 'success' : 'error',
      products,
      error: products.length === 0 ? '商品が見つかりませんでした' : undefined,
    };
  } catch (error) {
    // Abortエラーは再throw
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    return {
      siteId,
      status: 'error',
      products: [],
      error: error instanceof Error ? error.message : '取得に失敗しました',
    };
  }
}

export function useSiteProductFetch({
  keyword,
  selectedSites,
  batchMode = true,
}: UseSiteProductFetchOptions): UseSiteProductFetchResult {
  const [results, setResults] = useState<Partial<Record<SiteId, SiteResult>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // 初期結果を構築
  const initializeResults = useCallback((sites: SiteId[]) => {
    const initial: Partial<Record<SiteId, SiteResult>> = {};
    const fetchable = getFetchableSites(sites);
    const nonFetchable = getNonFetchableSites(sites);

    fetchable.forEach((siteId) => {
      initial[siteId] = { siteId, status: 'pending', products: [] };
    });

    nonFetchable.forEach((siteId) => {
      initial[siteId] = {
        siteId,
        status: 'skipped',
        products: [],
        error: 'リンクのみ利用可能',
      };
    });

    return initial;
  }, []);

  // 順次取得 + 一括表示（推奨）
  const fetchSequentialBatch = useCallback(
    async (sites: SiteId[], kw: string, signal: AbortSignal) => {
      const fetchableSites = getFetchableSites(sites);
      const accumulated: Partial<Record<SiteId, SiteResult>> = {};

      // 全サイトをloading状態に（1回のレンダリング）
      setResults((prev) => {
        const next = { ...prev };
        fetchableSites.forEach((siteId) => {
          next[siteId] = { siteId, status: 'loading', products: [] };
        });
        return next;
      });

      // 順次取得（結果を一時変数に蓄積）
      for (const siteId of fetchableSites) {
        if (signal.aborted) break;

        const result = await fetchSite(siteId, kw, signal);
        accumulated[siteId] = result;
      }

      // 全完了後、一括でstate更新（1回のレンダリング）
      if (!signal.aborted && isMountedRef.current) {
        setResults((prev) => ({ ...prev, ...accumulated }));
      }
    },
    []
  );

  // 並列取得 + 一括表示
  const fetchParallelBatch = useCallback(
    async (sites: SiteId[], kw: string, signal: AbortSignal) => {
      const fetchableSites = getFetchableSites(sites);

      // 全サイトをloading状態に
      setResults((prev) => {
        const next = { ...prev };
        fetchableSites.forEach((siteId) => {
          next[siteId] = { siteId, status: 'loading', products: [] };
        });
        return next;
      });

      // 並列取得
      const promises = fetchableSites.map((siteId) =>
        fetchSite(siteId, kw, signal).then((result) => ({ siteId, result }))
      );

      const settled = await Promise.allSettled(promises);

      // 一括でstate更新
      if (!signal.aborted && isMountedRef.current) {
        const accumulated: Partial<Record<SiteId, SiteResult>> = {};

        settled.forEach((outcome) => {
          if (outcome.status === 'fulfilled') {
            accumulated[outcome.value.siteId] = outcome.value.result;
          }
        });

        setResults((prev) => ({ ...prev, ...accumulated }));
      }
    },
    []
  );

  // メインのuseEffect
  useEffect(() => {
    if (!keyword.trim()) {
      setResults({});
      setIsLoading(false);
      return;
    }

    // 前回のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 初期状態を設定
    setResults(initializeResults(selectedSites));
    setIsLoading(true);

    const fetchAll = async () => {
      try {
        if (batchMode) {
          await fetchSequentialBatch(selectedSites, keyword, controller.signal);
        } else {
          await fetchParallelBatch(selectedSites, keyword, controller.signal);
        }
      } catch (error) {
        // Abortエラーは無視
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Fetch error:', error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchAll();

    // クリーンアップ
    return () => {
      controller.abort();
    };
  }, [keyword, selectedSites, batchMode, initializeResults, fetchSequentialBatch, fetchParallelBatch]);

  // アンマウント時のクリーンアップ
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 統計計算
  const siteIds = Object.keys(results) as SiteId[];
  const completedCount = siteIds.filter(
    (id) =>
      results[id]?.status === 'success' ||
      results[id]?.status === 'error' ||
      results[id]?.status === 'skipped'
  ).length;

  return {
    results,
    isLoading,
    completedCount,
    totalCount: selectedSites.length,
  };
}
