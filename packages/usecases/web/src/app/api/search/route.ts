import { NextRequest, NextResponse } from 'next/server';
import { UseCaseSearchEngine, type CategoryId, type Difficulty } from '@usecases/core';
import { getStorage } from '@/lib/storage';

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
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',') : undefined;
    const difficulty = searchParams.get('difficulty') as Difficulty | undefined;
    const language = searchParams.get('language') || undefined;
    const framework = searchParams.get('framework') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '20', 10);
    const sortBy = (searchParams.get('sortBy') as 'date' | 'popularity' | 'relevance') || 'date';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const result = await searchEngine.search({
      keyword,
      categories,
      tags,
      difficulty,
      language,
      framework,
      page,
      perPage,
      sortBy,
      sortOrder,
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
