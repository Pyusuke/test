import { MemoryStorage, type UseCase } from '@usecases/core';
import { createSampleUseCases } from '@usecases/collector-manual';
import { randomUUID } from 'crypto';

// サンプルデータを生成してUseCaseに変換
function generateSampleData(): UseCase[] {
  const samples = createSampleUseCases();
  const now = new Date();

  return samples.map((sample, index) => ({
    id: randomUUID(),
    title: sample.title,
    summary: sample.summary,
    description: sample.description,
    category: sample.category,
    tags: sample.tags ?? [],
    difficulty: sample.difficulty ?? 'intermediate',
    industry: sample.industry,
    role: sample.role,
    language: sample.language,
    framework: sample.framework,
    promptExample: sample.promptExample,
    outputExample: sample.outputExample,
    beforeAfter: sample.beforeAfter,
    source: {
      type: 'manual' as const,
      url: sample.sourceUrl,
      author: sample.author,
      authorUrl: sample.authorUrl,
    },
    status: 'published' as const,
    metrics: {
      viewCount: Math.floor(Math.random() * 100) + 10,
      likeCount: Math.floor(Math.random() * 50) + 5,
      shareCount: Math.floor(Math.random() * 20),
      useCount: Math.floor(Math.random() * 30) + 3,
    },
    createdAt: new Date(now.getTime() - index * 24 * 60 * 60 * 1000),
    updatedAt: now,
    collectedAt: now,
  }));
}

// グローバルでデータを保持（ウォームスタート時は再利用）
let cachedData: UseCase[] | null = null;

export function getStorage(): MemoryStorage {
  if (!cachedData) {
    cachedData = generateSampleData();
  }
  return new MemoryStorage(cachedData);
}

export function updateCache(storage: MemoryStorage): void {
  storage.getAll().then(data => {
    cachedData = data;
  });
}
