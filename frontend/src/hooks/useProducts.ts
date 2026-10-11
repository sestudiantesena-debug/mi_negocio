import useSWR from 'swr';
import { productsApi } from '@/lib/api';
import type { Product, ProductListResponse } from '@/types';

export function useProducts(params?: {
  page?: number;
  page_size?: number;
  category?: string;
  search?: string;
  is_active?: boolean;
  min_price?: number;
  max_price?: number;
}) {
  const key = ['products', params];
  const { data, error, isLoading, mutate } = useSWR<ProductListResponse>(
    key,
    () => productsApi.list(params),
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );

  return {
    products: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pageSize: data?.page_size || 20,
    totalPages: data?.total_pages || 0,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useProduct(id: number) {
  const key = id ? ['product', id] : null;
  const { data, error, isLoading, mutate } = useSWR<Product>(
    key,
    () => productsApi.get(id!),
    { revalidateOnFocus: false }
  );

  return { product: data, isLoading, isError: !!error, error, mutate };
}

export function useCategories() {
  const { data, error, isLoading } = useSWR<string[]>(
    'categories',
    () => productsApi.categories(),
    { revalidateOnFocus: false }
  );

  return { categories: data || [], isLoading, isError: !!error, error };
}