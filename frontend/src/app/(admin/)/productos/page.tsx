'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductModal } from './ProductModal';
import { Button } from '@/components/ui';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import { productsApi, type Product, type ProductListResponse } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [categories, setCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productsApi.list({
        page,
        page_size: pageSize,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        min_price: priceRange[0] > minPrice ? priceRange[0] : undefined,
        max_price: priceRange[1] < maxPrice ? priceRange[1] : undefined,
      });
      setProducts(response.items);
      setTotal(response.total);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await productsApi.categories();
      setCategories(cats);
      if (cats.length > 0) {
        setMaxPrice(Math.max(...cats.map(c => 10000)));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await productsApi.delete(id);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
  };

  const handleProductSaved = () => {
    setModalOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const hasActiveFilters = searchQuery || selectedCategory || priceRange[0] > minPrice || priceRange[1] < maxPrice;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange([minPrice, maxPrice]);
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
            <p className="text-gray-500">{total} productos en total</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo producto
          </Button>
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

        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
              <p className="text-gray-500">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron productos</h3>
              <p className="text-gray-500">Intenta ajustar los filtros o crea un nuevo producto</p>
            </div>
          ) : (
            <>
              <ProductGrid products={products} variant="compact" className="p-4 border-b border-gray-100" />
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, total)} de {total} productos
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editingProduct}
        onSave={handleProductSaved}
        categories={categories}
      />
    </AdminLayout>
  );
}