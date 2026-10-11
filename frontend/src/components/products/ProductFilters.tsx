'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Input, Label } from '@/components/ui';

interface ProductFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  minPrice: number;
  maxPrice: number;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  priceRange,
  onPriceRangeChange,
  minPrice,
  maxPrice,
  onClear,
  hasActiveFilters,
}: ProductFiltersProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <Filter className="h-5 w-5 mr-1" />
          Filtros {hasActiveFilters && <span className="badge bg-primary-600">Activos</span>}
        </Button>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input pl-10"
            aria-label="Buscar productos"
          />
        </div>
      </div>

      <div className={cn('space-y-4 transition-all duration-200', isMobileOpen || 'lg:block' ? 'block' : 'hidden lg:block')}>
        <div>
          <Label htmlFor="category">Categoría</Label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="input"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="price-range">
            Precio: {priceRange[0] === minPrice && priceRange[1] === maxPrice
              ? 'Todo'
              : `${priceRange[0]} - ${priceRange[1]}`}
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              id="price-min"
              min={minPrice}
              max={maxPrice}
              value={priceRange[0]}
              onChange={(e) => onPriceRangeChange([parseInt(e.target.value), priceRange[1]])}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <span className="text-sm text-gray-500 w-20 text-right">{priceRange[0]}</span>
            <input
              type="range"
              id="price-max"
              min={minPrice}
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <span className="text-sm text-gray-500 w-20">{priceRange[1]}</span>
          </div>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="w-full justify-start">
            <X className="h-4 w-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}