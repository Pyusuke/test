import { NextRequest, NextResponse } from 'next/server';
import { JsonStorage, UseCaseSearchEngine, type CategoryId } from '@usecases/core';
import { ManualCollector, createSampleUseCases } from '@usecases/collector-manual';
import path from 'path';

// ストレージのパスを設定
const dataDir = path.join(process.cwd(), 'data');
const storage = new JsonStorage(dataDir);
const searchEngine = new UseCaseSearchEngine(storage);

// 初期データの投入フラグ
let initialized = false;

async function ensureInitialized() {
  if (initialized) return;

  const count = await storage.count();
  if (count === 0) {
    // サンプルデータを投入
    const collector = new ManualCollector();
    const samples = createSampleUseCases();
    collector.addUseCases(samples);
    const result = await collector.collect();

    // ステータスをpublishedに設定して保存
    for (const uc of result.usecases) {
      await storage.create({ ...uc, status: 'published' });
    }
  }

  initialized = true;
}

export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();

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
        'Cache-Control': 'public, max-age=60',
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
    await ensureInitialized();

    const body = await request.json();
    const usecase = await storage.create(body);

    return NextResponse.json(usecase, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
