import { NextRequest, NextResponse } from 'next/server';
import { SuggestionEngine, type CategoryId, type Difficulty } from '@usecases/core';
import { getStorage } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const storage = getStorage();
    const suggestionEngine = new SuggestionEngine(storage);

    const body = await request.json();

    const {
      currentTask,
      language,
      framework,
      industry,
      role,
      categories,
      difficulty,
      maxResults,
    } = body as {
      currentTask?: string;
      language?: string;
      framework?: string;
      industry?: string;
      role?: string;
      categories?: CategoryId[];
      difficulty?: Difficulty;
      maxResults?: number;
    };

    const result = await suggestionEngine.suggest({
      currentTask,
      language,
      framework,
      industry,
      role,
      categories,
      difficulty,
      maxResults: maxResults ?? 5,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Suggest API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const storage = getStorage();
    const suggestionEngine = new SuggestionEngine(storage);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'popular';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    let usecases;
    if (type === 'recent') {
      usecases = await suggestionEngine.getRecent(limit);
    } else {
      usecases = await suggestionEngine.getPopular(limit);
    }

    return NextResponse.json({ usecases }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Suggest API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
