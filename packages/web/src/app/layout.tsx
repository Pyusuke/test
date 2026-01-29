import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '部品検索',
  description: '複数サイトから部品を横断検索',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">部品検索</h1>
            <p className="text-sm text-gray-500">複数サイトから部品を横断検索</p>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
