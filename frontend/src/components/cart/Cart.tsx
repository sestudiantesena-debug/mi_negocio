'use client';

import { useCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { CartItem } from '@/types';

export function CartSidebar() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu carrito está vacío</h3>
          <p className="text-gray-500 mb-6">Añade productos para comenzar tu compra</p>
          <Button onClick={() => window.location.href = '/productos'}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ver productos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end lg:justify-end">
      <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={() => window.history.back()} />
      <aside className="bg-white shadow-xl w-full max-w-md lg:max-w-lg h-full flex flex-col animate-slide-up">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">Carrito ({getTotalItems()})</h2>
          <button onClick={() => window.history.back()} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.map((item: CartItem) => (
            <div key={item.product.id} className="flex gap-3">
              <div className="relative h-20 w-20 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                {item.product.images[0] ? (
                  <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                ) : (
                  <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto my-auto" />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 truncate">{item.product.name}</h4>
                  <p className="text-sm text-primary-600 font-semibold">{formatCurrency(item.product.price)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-lg font-semibold text-gray-900">{formatCurrency(getTotalPrice())}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Envío</span>
            <span>Calcular en checkout</span>
          </div>
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary-600">{formatCurrency(getTotalPrice())}</span>
          </div>

          <Button className="w-full" size="lg" asChild>
            <Link href="/carrito">
              <ArrowRight className="h-4 w-4 ml-2" />
              Ir al checkout
            </Link>
          </Button>

          <Button variant="ghost" className="w-full" onClick={clearCart}>
            Vaciar carrito
          </Button>
        </div>
      </aside>
    </div>
  );
}

export function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();

  return (
    <div className="container-main py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tu carrito</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu carrito está vacío</h3>
          <p className="text-gray-500 mb-6">Añade productos para comenzar tu compra</p>
          <Button onClick={() => window.location.href = '/productos'}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ver productos
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item: CartItem) => (
              <div key={item.product.id} className="card flex flex-col sm:flex-row gap-4 p-4">
                <div className="relative h-32 w-32 sm:h-24 sm:w-24 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                  {item.product.images[0] ? (
                    <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                  ) : (
                    <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto my-auto" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">{formatCurrency(item.product.price)} c/u</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="card sticky top-24 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Resumen del pedido</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                  <span className="font-medium">{formatCurrency(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Envío</span>
                  <span>Calcular en checkout</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">{formatCurrency(getTotalPrice())}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" asChild>
                <Link href="/carrito/checkout">
                  <ArrowRight className="h-4 w-4 ml-2" />
                  Proceder al pago
                </Link>
              </Button>

              <Button variant="ghost" className="w-full" onClick={clearCart}>
                Vaciar carrito
              </Button>

              <p className="text-xs text-center text-gray-500">
                Al continuar, aceptas nuestros <a href="#" className="underline">Términos y Condiciones</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}