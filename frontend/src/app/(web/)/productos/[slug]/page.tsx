'use client';

import { useParams } from 'next/navigation';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { CartSidebar } from '@/components/cart/Cart';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, MessageCircle, Truck, RotateCcw, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const productId = parseInt(slug.split('-').pop() || '0');
  const { product, isLoading, isError } = useProduct(productId);
  const { addItem, items } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const inCart = items.find((item) => item.product.id === productId);
  const cartQuantity = inCart?.quantity || 0;

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '521xxxxxxxxxx';
    const message = `Hola, me interesa: ${product.name} (${formatCurrency(product.price)})`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="container-main py-12">
        <div className="grid lg:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container-main py-12 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h1>
        <p className="text-gray-500 mb-6">El producto que buscas no existe o ha sido eliminado</p>
        <Link href="/productos" className="btn btn-primary">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const isInStock = product.stock > 0;

  return (
    <>
      <div className="container-main py-8">
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-primary-600">Inicio</Link></li>
            <li className="text-gray-300">/</li>
            <li><Link href="/productos" className="hover:text-primary-600">Productos</Link></li>
            <li className="text-gray-300">/</li>
            <li><Link href={`/productos?category=${encodeURIComponent(product.category)}`} className="hover:text-primary-600">{product.category}</Link></li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-900 font-medium truncate max-w-xs" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
              {product.images[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <ShoppingCart className="h-24 w-24" />
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'flex-shrink-0 h-20 w-20 rounded-lg overflow-hidden border-2 transition-colors',
                      selectedImage === i ? 'border-primary-600' : 'border-gray-200 hover:border-gray-300'
                    )}
                    aria-label={`Ver imagen ${i + 1}`}
                    aria-current={selectedImage === i}
                  >
                    <Image src={img} alt={`${product.name} - vista ${i + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                {product.category}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                SKU: {product.sku}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-primary-600">{formatCurrency(product.price)}</span>
              {product.metadata?.originalPrice && (
                <span className="text-xl text-gray-400 line-through">{formatCurrency(Number(product.metadata.originalPrice))}</span>
              )}
            </div>

            {product.description && (
              <div className="prose prose-gray mb-6 max-w-none">
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Truck className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-800">Envío gratis en compras > $999</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <RotateCcw className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-800">Devoluciones 30 días</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center gap-4 mb-6">
                <label htmlFor="quantity" className="font-medium text-gray-700">Cantidad:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700"
                    disabled={quantity <= 1}
                    aria-label="Disminuir cantidad"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={product.stock}
                    className="w-16 text-center border-x border-gray-300 focus:outline-none"
                    aria-label="Cantidad"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700"
                    disabled={quantity >= product.stock}
                    aria-label="Aumentar cantidad"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">Stock: {product.stock}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!isInStock || addedToCart}
                >
                  {addedToCart ? (
                    <>
                      <span className="mr-2">✓</span>
                      ¡Añadido al carrito!
                    </>
                  ) : inCart ? (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Actualizar carrito ({cartQuantity + quantity})
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Añadir al carrito
                    </>
                  )}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 sm:w-auto"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
              </div>

              {!isInStock && (
                <p className="mt-4 text-red-600 font-medium flex items-center gap-2">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  Producto agotado temporalmente
                </p>
              )}
            </div>
          </div>
        </div>

        {product.metadata?.features && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Características destacadas</h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.metadata.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Star className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">También te puede interesar</h2>
          <Link href="/productos" className="btn btn-outline">
            Ver todo el catálogo
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>

      <CartSidebar />
      <ChatWidget />
    </>
  );
}