import { NextRequest, NextResponse } from 'next/server';
import { JsonStorage, UseCaseSearchEngine, type CategoryId, type Difficulty } from '@usecases/core';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const storage = new JsonStorage(dataDir);
const searchEngine = new UseCaseSearchEngine(storage);

export async function GET(request: NextRequest) {
  try {
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
        'Cache-Control': 'public, max-age=60',
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
