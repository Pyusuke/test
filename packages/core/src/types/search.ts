import { z } from 'zod';
import { SiteIdSchema, type Product } from './product';

export const SearchQuerySchema = z.object({
  keyword: z.string().min(1),
  sites: z.array(SiteIdSchema).optional(),
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().max(100).default(20),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const SortFieldSchema = z.enum(['price', 'name', 'relevance']);
export type SortField = z.infer<typeof SortFieldSchema>;

export const SortOrderSchema = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof SortOrderSchema>;

export interface SiteSearchResult {
  siteId: string;
  siteName: string;
  status: 'success' | 'error' | 'timeout';
  products: Product[];
  totalCount: number;
  hasMore: boolean;
  error?: string;
  executionTimeMs: number;
}

export interface SearchResult {
  query: SearchQuery;
  products: Product[];
  totalCount: number;
  siteResults: SiteSearchResult[];
  executionTimeMs: number;
}
