'use client';

import type { Difficulty } from '@usecases/core/client';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  size?: 'sm' | 'md';
}

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; color: string; bgColor: string }
> = {
  beginner: {
    label: '初心者向け',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  intermediate: {
    label: '中級者向け',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  advanced: {
    label: '上級者向け',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
};

export function DifficultyBadge({ difficulty, size = 'sm' }: DifficultyBadgeProps) {
  const config = DIFFICULTY_CONFIG[difficulty];

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center ${sizeClasses} ${config.bgColor} ${config.color} rounded-full font-medium`}
    >
      {config.label}
    </span>
  );
}
