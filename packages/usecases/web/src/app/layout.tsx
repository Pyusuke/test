import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Claude Code 活用事例集',
  description: 'Claude Codeの業務効率化活用事例を検索・提案するポータルサイト',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <a href="/" className="flex items-center space-x-2">
                <span className="text-2xl">🤖</span>
                <span className="font-bold text-xl text-gray-900">
                  Claude Code 活用事例集
                </span>
              </a>
              <nav className="flex space-x-6">
                <a
                  href="/"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  ホーム
                </a>
                <a
                  href="/usecases"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  事例一覧
                </a>
                <a
                  href="/suggest"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  提案を受ける
                </a>
              </nav>
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-gray-50 border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-gray-500 text-sm">
              Claude Code 活用事例集 - 業務効率化のためのナレッジベース
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
