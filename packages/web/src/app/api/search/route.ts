import { NextRequest, NextResponse } from 'next/server';
import {
  SearchEngine,
  AdapterRegistry,
  type SearchQuery,
  type SiteId,
} from '@parts-search/core';
import { MonotaroAdapter } from '@parts-search/adapter-monotaro';
import { MisumiAdapter } from '@parts-search/adapter-misumi';
import { AmazonAdapter } from '@parts-search/adapter-amazon';
import { HobuhinAdapter } from '@parts-search/adapter-hobuhin';
import { AskulAdapter } from '@parts-search/adapter-askul';
import { AxelAdapter } from '@parts-search/adapter-axel';
import { AperzaAdapter } from '@parts-search/adapter-aperza';

const registry = new AdapterRegistry();
registry.register(new MonotaroAdapter());
registry.register(new MisumiAdapter());
registry.register(new AmazonAdapter());
registry.register(new HobuhinAdapter());
registry.register(new AskulAdapter());
registry.register(new AxelAdapter());
registry.register(new AperzaAdapter());

const searchEngine = new SearchEngine(registry);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword');
  const sitesParam = searchParams.get('sites');
  const page = searchParams.get('page');
  const perPage = searchParams.get('perPage');

  if (!keyword) {
    return NextResponse.json(
      { error: 'keyword is required' },
      { status: 400 }
    );
  }

  const query: SearchQuery = {
    keyword,
    sites: sitesParam
      ? (sitesParam.split(',').filter(Boolean) as SiteId[])
      : undefined,
    page: page ? parseInt(page, 10) : 1,
    perPage: perPage ? parseInt(perPage, 10) : 20,
  };

  try {
    const result = await searchEngine.search(query);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
