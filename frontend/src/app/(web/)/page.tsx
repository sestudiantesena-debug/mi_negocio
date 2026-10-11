'use client';

import Link from 'next/link';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Button } from '@/components/ui';
import { ArrowRight, ShoppingCart, MessageCircle, Zap, Shield, Truck, Headphones } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const features = [
  {
    icon: Zap,
    title: 'Asistente IA 24/7',
    description: 'Nuestro bot inteligente atiende a tus clientes en WhatsApp y Facebook todo el día, todos los días.',
  },
  {
    icon: ShoppingCart,
    title: 'Compra por chat',
    description: 'Los clientes pueden ver productos, hacer preguntas y comprar directamente desde la conversación.',
  },
  {
    icon: Shield,
    title: 'Pagos seguros',
    description: 'Integración con pasarelas de pago confiables. También aceptamos transferencia y efectivo.',
  },
  {
    icon: Truck,
    title: 'Envíos a todo México',
    description: 'Envíos rápidos y seguros a toda la República. Gratis en compras mayores a $999.',
  },
];

const ctaButtons = [
  {
    label: 'Ver catálogo',
    href: '/productos',
    icon: ShoppingCart,
    primary: true,
  },
  {
    label: 'Hablar por WhatsApp',
    href: 'https://wa.me/521xxxxxxxxxx?text=Hola%2C%20me%20interesa%20su%20cat%C3%A1logo',
    icon: MessageCircle,
    primary: false,
    external: true,
  },
];

export default function HomePage() {
  const { products: featuredProducts, isLoading } = useProducts({ page_size: 8, is_active: true });
  const { categories, isLoading: categoriesLoading } = useCategories();

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20 lg:py-32">
        <div className="container-main">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Tu tienda con <span className="text-primary-600">IA conversacional</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Automatiza tus ventas en WhatsApp y Facebook. Nuestro asistente inteligente
              muestra productos, responde dudas y cierra ventas mientras tú descansas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {ctaButtons.map((btn) => (
                <a
                  key={btn.label}
                  href={btn.href}
                  target={btn.external ? '_blank' : undefined}
                  rel={btn.external ? 'noopener noreferrer' : undefined}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold text-base transition-all',
                    btn.primary
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/25'
                      : 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50'
                  )}
                >
                  {btn.icon && <btn.icon className="h-5 w-5" />}
                  {btn.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" aria-hidden="true" />
      </section>

      <section className="section" aria-labelledby="features-heading">
        <div className="container-main">
          <header className="text-center max-w-2xl mx-auto mb-16">
            <h2 id="features-heading" className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir mi_negocio?
            </h2>
            <p className="text-lg text-gray-600">
              Diseñado para emprendedores que quieren escalar sin complicaciones técnicas.
            </p>
          </header>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <article key={index} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4 text-primary-600">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-gray-50" aria-labelledby="products-heading">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 id="products-heading" className="text-3xl font-bold text-gray-900">Productos destacados</h2>
              <p className="text-gray-600">Nuestra selección más popular</p>
            </div>
            <Link href="/productos" className="btn btn-outline whitespace-nowrap">
              Ver todo el catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ProductGrid products={featuredProducts} emptyMessage="No hay productos destacados" />
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="categories-heading">
        <div className="container-main">
          <header className="text-center max-w-2xl mx-auto mb-12" id="categorias">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explora por categoría</h2>
            <p className="text-lg text-gray-600">Encuentra lo que necesitas en nuestra variedad de departamentos</p>
          </header>

          {categoriesLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/productos?category=${encodeURIComponent(category)}`}
                  className="card aspect-square flex flex-col items-center justify-center p-8 text-center hover:bg-primary-50 hover:border-primary-200 transition-all group"
                >
                  <div className="h-16 w-16 rounded-xl bg-primary-100 flex items-center justify-center mb-4 text-primary-600 group-hover:scale-110 transition-transform">
                    <ShoppingCart className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {category}
                  </h3>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="section bg-primary-600 text-white" aria-labelledby="cta-heading">
        <div className="container-main text-center">
          <h2 id="cta-heading" className="text-3xl lg:text-4xl font-bold mb-4">
            ¿Listo para automatizar tus ventas?
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Únete a cientos de emprendedores que ya usan mi_negocio para vender más con menos esfuerzo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/521xxxxxxxxxx?text=Hola%2C%20quiero%20automatizar%20mis%20ventas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Empezar en WhatsApp
            </a>
            <a
              href="/productos"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Ver catálogo
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

import { cn } from '@/lib/utils';