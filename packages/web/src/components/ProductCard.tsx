'use client';

import type { Product } from '@parts-search/core';
import { SITE_INFO } from '@parts-search/core';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const siteInfo = SITE_INFO[product.source];

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const getAvailabilityBadge = () => {
    switch (product.availability.status) {
      case 'in_stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            在庫あり
          </span>
        );
      case 'low_stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            残りわずか
          </span>
        );
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            在庫なし
          </span>
        );
      case 'made_to_order':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            受注生産
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {siteInfo.name}
          </span>
          {getAvailabilityBadge()}
        </div>

        {product.images[0] && (
          <div className="aspect-square mb-3 bg-gray-100 rounded overflow-hidden">
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        )}

        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
          {product.name}
        </h3>

        {product.manufacturer && (
          <p className="text-xs text-gray-500 mb-1">{product.manufacturer}</p>
        )}

        {product.partNumber && (
          <p className="text-xs text-gray-400 mb-2">型番: {product.partNumber}</p>
        )}

        <div className="flex items-end justify-between mt-auto">
          <div>
            {product.price.amount > 0 ? (
              <>
                <p className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price.amount)}
                </p>
                <p className="text-xs text-gray-500">
                  {product.price.taxIncluded ? '(税込)' : '(税別)'}
                  {product.price.unit && ` / ${product.price.unit}`}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">価格はサイトでご確認ください</p>
            )}
          </div>
        </div>

        {product.availability.leadTime && (
          <p className="text-xs text-gray-500 mt-2">
            {product.availability.leadTime}
          </p>
        )}
      </div>
    </a>
  );
}
