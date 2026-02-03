import { NextRequest, NextResponse } from 'next/server';
import { UseCaseSearchEngine, type CategoryId } from '@usecases/core';
import { getStorage, updateCache } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const storage = getStorage();
    const searchEngine = new UseCaseSearchEngine(storage);

    const { searchParams } = new URL(request.url);

    const keyword = searchParams.get('keyword') || undefined;
    const categoriesParam = searchParams.get('categories');
    const categories = categoriesParam
      ? (categoriesParam.split(',') as CategoryId[])
      : undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '20', 10);
    const sortBy = (searchParams.get('sortBy') as 'date' | 'popularity' | 'relevance') || 'date';

    const result = await searchEngine.search({
      keyword,
      categories,
      page,
      perPage,
      sortBy,
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const storage = getStorage();
    const body = await request.json();
    const usecase = await storage.create(body);

    updateCache(storage);

    return NextResponse.json(usecase, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
