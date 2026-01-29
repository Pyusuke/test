'use client';

interface Category {
  id: string;
  name: string;
  icon: string;
  keywords: string[];
}

const CATEGORIES: Category[] = [
  {
    id: 'bolts',
    name: 'ボルト・ナット',
    icon: '🔩',
    keywords: ['六角ボルト M8', '六角ナット M10', 'キャップボルト M6', 'フランジボルト'],
  },
  {
    id: 'bearings',
    name: 'ベアリング',
    icon: '⚙️',
    keywords: ['ベアリング 6200', '深溝玉軸受 6001', 'ニードルベアリング', 'スラストベアリング'],
  },
  {
    id: 'seals',
    name: 'シール・Oリング',
    icon: '⭕',
    keywords: ['Oリング P10', 'オイルシール TC', 'パッキン', 'ガスケット'],
  },
  {
    id: 'belts',
    name: 'ベルト・チェーン',
    icon: '🔗',
    keywords: ['タイミングベルト 2GT', 'Vベルト A型', 'ローラーチェーン #40', 'コンベヤベルト'],
  },
  {
    id: 'pneumatics',
    name: '空圧機器',
    icon: '💨',
    keywords: ['エアシリンダー CDA2', '電磁弁 SY3000', 'レギュレータ', 'エアチューブ 6mm'],
  },
  {
    id: 'electronics',
    name: '電子部品',
    icon: '⚡',
    keywords: ['シーケンサ FX', 'サーボモーター', 'センサー 光電', 'リレー MY2N'],
  },
];

interface CategorySearchProps {
  onSearch: (keyword: string) => void;
}

export function CategorySearch({ onSearch }: CategorySearchProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 border-b">
        <h3 className="font-medium text-gray-800">カテゴリから探す</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((category) => (
            <div key={category.id} className="group">
              <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                <div className="text-center mb-2">
                  <span className="text-2xl">{category.icon}</span>
                  <p className="text-sm font-medium text-gray-700 mt-1">{category.name}</p>
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {category.keywords.slice(0, 2).map((kw) => (
                    <button
                      key={kw}
                      onClick={() => onSearch(kw)}
                      className="px-2 py-0.5 bg-white text-xs text-gray-600 rounded border hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors truncate max-w-full"
                      title={kw}
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
