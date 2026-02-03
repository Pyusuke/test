import type { CategoryId } from './usecase';

/**
 * カテゴリ情報
 */
export interface CategoryInfo {
  id: CategoryId;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * カテゴリ定義マスタ
 */
export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  'code-generation': {
    id: 'code-generation',
    name: 'コード生成',
    nameEn: 'Code Generation',
    description: '新規コードの生成、ボイラープレート作成',
    icon: '⚡',
    color: 'blue',
  },
  'code-review': {
    id: 'code-review',
    name: 'コードレビュー',
    nameEn: 'Code Review',
    description: 'コードの品質チェック、改善提案',
    icon: '🔍',
    color: 'purple',
  },
  'debugging': {
    id: 'debugging',
    name: 'デバッグ',
    nameEn: 'Debugging',
    description: 'バグの特定、原因分析、修正',
    icon: '🐛',
    color: 'red',
  },
  'documentation': {
    id: 'documentation',
    name: 'ドキュメント作成',
    nameEn: 'Documentation',
    description: 'README、APIドキュメント、コメント生成',
    icon: '📝',
    color: 'green',
  },
  'testing': {
    id: 'testing',
    name: 'テスト作成',
    nameEn: 'Testing',
    description: 'ユニットテスト、E2Eテストの生成',
    icon: '🧪',
    color: 'yellow',
  },
  'refactoring': {
    id: 'refactoring',
    name: 'リファクタリング',
    nameEn: 'Refactoring',
    description: 'コードの整理、パフォーマンス改善',
    icon: '🔧',
    color: 'orange',
  },
  'architecture': {
    id: 'architecture',
    name: '設計・アーキテクチャ',
    nameEn: 'Architecture',
    description: 'システム設計、構成検討',
    icon: '🏗️',
    color: 'indigo',
  },
  'learning': {
    id: 'learning',
    name: '学習・スキルアップ',
    nameEn: 'Learning',
    description: '新技術の学習、コード解説',
    icon: '📚',
    color: 'cyan',
  },
  'automation': {
    id: 'automation',
    name: '自動化・効率化',
    nameEn: 'Automation',
    description: 'ワークフロー自動化、スクリプト作成',
    icon: '🤖',
    color: 'teal',
  },
  'data-analysis': {
    id: 'data-analysis',
    name: 'データ分析',
    nameEn: 'Data Analysis',
    description: 'データ処理、分析、可視化',
    icon: '📊',
    color: 'pink',
  },
  'devops': {
    id: 'devops',
    name: 'DevOps・インフラ',
    nameEn: 'DevOps',
    description: 'CI/CD、インフラ構成、デプロイ',
    icon: '🚀',
    color: 'gray',
  },
  'other': {
    id: 'other',
    name: 'その他',
    nameEn: 'Other',
    description: 'その他の活用事例',
    icon: '💡',
    color: 'slate',
  },
};

/**
 * カテゴリIDからカテゴリ情報を取得
 */
export function getCategoryInfo(id: CategoryId): CategoryInfo {
  return CATEGORIES[id];
}

/**
 * 全カテゴリをリストで取得
 */
export function getAllCategories(): CategoryInfo[] {
  return Object.values(CATEGORIES);
}
