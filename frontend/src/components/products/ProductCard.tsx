'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
  showWhatsApp?: boolean;
}

export function ProductCard({ product, variant = 'default', showWhatsApp = true }: ProductCardProps) {
  const { addItem } = useCart();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '521xxxxxxxxxx';
  const whatsappMessage = `Hola, me interesa el producto: ${product.name} (${formatCurrency(product.price)})`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
      '_blank'
    );
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
        <Link href={`/productos/${product.slug || product.id}`} className="flex-shrink-0">
          <div className="relative h-16 w-16 rounded-lg bg-gray-100 overflow-hidden">
            {product.images[0] ? (
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="64px" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <ShoppingCart className="h-8 w-8" />
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/productos/${product.slug || product.id}`} className="block">
            <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
            <p className="text-sm text-primary-600 font-semibold">{formatCurrency(product.price)}</p>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleAddToCart} disabled={product.stock === 0}>
            <ShoppingCart className="h-4 w-4" />
          </Button>
          {showWhatsApp && (
            <Button size="sm" variant="outline" onClick={handleWhatsApp}>
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <article className="card group flex flex-col h-full">
      <Link href={`/productos/${product.slug || product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <ShoppingCart className="h-16 w-16" />
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-lg">
              Agotado
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</span>
          {product.metadata?.badge && (
            <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
              {product.metadata.badge}
            </span>
          )}
        </div>

        <Link href={`/productos/${product.slug || product.id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">{product.description}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xl font-bold text-primary-600">{formatCurrency(product.price)}</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Añadir
            </Button>
            {showWhatsApp && (
              <Button size="sm" variant="ghost" onClick={handleWhatsApp} className="p-2">
                <MessageCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}