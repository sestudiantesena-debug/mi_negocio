'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui';
import { Button, Input, Label, Textarea } from '@/components/ui';
import { Loader2, Image as ImageIcon, Plus, Trash2, X } from 'lucide-react';
import { productsApi, type Product } from '@/lib/api';
import { cn } from '@/lib/utils';

const productSchema = z.object({
  sku: z.string().min(1, 'SKU es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  description: z.string().optional(),
  price: z.number().min(0, 'Precio debe ser positivo'),
  stock: z.number().min(0, 'Stock no puede ser negativo'),
  category: z.string().min(1, 'Categoría es requerida'),
  images: z.array(z.string().url('URL inválida')).optional(),
  is_active: z.boolean(),
  metadata: z.record(z.unknown()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: () => void;
  categories: string[];
}

export function ProductModal({ isOpen, onClose, product, onSave, categories }: ProductModalProps) {
  const isEditing = !!product;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      images: [],
      is_active: true,
      metadata: {},
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        stock: product.stock,
        category: product.category,
        images: product.images || [],
        is_active: product.is_active,
        metadata: product.metadata || {},
      });
      setImageUrls(product.images || []);
    } else {
      reset({
        sku: '',
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        images: [],
        is_active: true,
        metadata: {},
      });
      setImageUrls([]);
    }
  }, [product, reset]);

  const addImage = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl.trim())) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (url: string) => {
    setImageUrls(imageUrls.filter((u) => u !== url));
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        images: imageUrls,
        price: Number(data.price),
        stock: Number(data.stock),
      };

      if (isEditing && product) {
        await productsApi.update(product.id, payload);
      } else {
        await productsApi.create(payload);
      }
      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar producto' : 'Nuevo producto'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              {...register('sku')}
              disabled={isEditing}
              placeholder="MN-CAT-0001"
              error={errors.sku?.message}
            />
          </div>
          <div>
            <Label htmlFor="category">Categoría *</Label>
            <select
              id="category"
              {...register('category')}
              className="input"
              error={!!errors.category}
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Nombre del producto"
              error={errors.name?.message}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción detallada del producto"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="price">Precio *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              {...register('price', { valueAsNumber: true })}
              placeholder="0.00"
              error={errors.price?.message}
            />
          </div>
          <div>
            <Label htmlFor="stock">Stock *</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              {...register('stock', { valueAsNumber: true })}
              placeholder="0"
              error={errors.stock?.message}
            />
          </div>
        </div>

        <div>
          <Label>Imágenes</Label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={addImage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative group h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt={`Imagen ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            {...register('is_active')}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <Label htmlFor="is_active" className="mb-0 cursor-pointer">
            Producto activo
          </Label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}