'use client';

import { ProductCard } from './ProductCard';
import type { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  variant?: 'default' | 'compact';
  emptyMessage?: string;
  className?: string;
}

export function ProductGrid({
  products,
  variant = 'default',
  emptyMessage = 'No se encontraron productos',
  className,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} variant="compact" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';