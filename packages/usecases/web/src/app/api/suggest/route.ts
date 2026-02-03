import { NextRequest, NextResponse } from 'next/server';
import { JsonStorage, SuggestionEngine, type CategoryId, type Difficulty } from '@usecases/core';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const storage = new JsonStorage(dataDir);
const suggestionEngine = new SuggestionEngine(storage);

export async function POST(request: NextRequest) {
  try {
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
        'Cache-Control': 'public, max-age=300',
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
