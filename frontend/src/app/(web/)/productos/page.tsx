'use client';

import { useState, useEffect } from 'react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { ProductGrid, ProductFilters } from '@/components/products';
import { CartSidebar } from '@/components/cart/Cart';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { ShoppingCart, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function ProductosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const {
    products,
    isLoading,
    total,
    totalPages,
    mutate,
    categories,
    isLoading: categoriesLoading,
  } = useProducts({
    page,
    page_size: 12,
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
    min_price: priceRange[0] > 0 ? priceRange[0] : undefined,
    max_price: priceRange[1] < 10000 ? priceRange[1] : undefined,
    is_active: true,
  });

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  useEffect(() => {
    if (categories.length > 0) {
      setMaxPrice(Math.max(...categories.map(() => 10000)));
    }
  }, [categories]);

  const hasActiveFilters = searchQuery || selectedCategory || priceRange[0] > 0 || priceRange[1] < 10000;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange([0, 10000]);
    setPage(1);
  };

  return (
    <>
      <div className="bg-gray-50 py-12">
        <div className="container-main">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Catálogo de productos</h1>
          <p className="text-gray-600">Encuentra lo que necesitas en nuestro catálogo</p>
        </div>
      </div>

      <div className="container-main py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={cn('lg:w-64 flex-shrink-0', mobileFiltersOpen ? 'block' : 'hidden lg:block')}>
            <div className="card p-4 sticky top-24 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Filtros</h2>
                <button
                  className="lg:hidden text-gray-400 hover:text-gray-600"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <ProductFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onClear={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Filtros {hasActiveFilters && <span className="ml-1 bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded text-xs">Activos</span>}
                </Button>
                <p className="text-sm text-gray-500">
                  {total} producto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="card overflow-hidden">
              {isLoading ? (
                <div className="p-8">
                  <ProductGrid products={Array(8).fill(null).map((_, i) => ({ id: i, name: '', price: 0, stock: 0, category: '', images: [], is_active: true, sku: '', description: null, metadata: {}, created_at: '', updated_at: '' }))} />
                </div>
              ) : products.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron productos</h3>
                  <p className="text-gray-500 mb-4">Intenta ajustar los filtros o busca con otros términos</p>
                  <Button variant="outline" onClick={clearFilters}>Limpiar filtros</Button>
                </div>
              ) : (
                <>
                  <ProductGrid products={products} />
                  <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Mostrando {(page - 1) * 12 + 1} a {Math.min(page * 12, total)} de {total} productos
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                        Anterior
                      </Button>
                      <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
                      <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      <CartSidebar />
      <ChatWidget />
    </>
  );
}