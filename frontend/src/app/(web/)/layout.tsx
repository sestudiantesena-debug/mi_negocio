import Link from 'next/link';
import { CartSidebar } from '@/components/cart/Cart';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { ShoppingCart, Menu, X, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Productos', href: '/productos' },
  { name: 'Categorías', href: '/productos#categorias' },
];

export default function WebLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getTotalItems } = useCart();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <nav className="container-main flex items-center justify-between h-16" aria-label="Navegación principal">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-primary-600" aria-label="mi_negocio - Inicio">
              mi_negocio
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/productos" className="hidden sm:block btn btn-primary text-sm">
              Ver catálogo
            </Link>

            <Link href="/carrito" className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Carrito de compras">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary-600 text-white text-xs font-medium flex items-center justify-center">
                {getTotalItems()}
              </span>
            </Link>

            <button
              className="md:hidden text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="container-main flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/carrito"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5" />
                Carrito ({getTotalItems()})
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1" role="main">
        {children}
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container-main">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4">mi_negocio</h3>
              <p className="text-gray-400 max-w-sm">
                Tu tienda inteligente con asistente de ventas IA para WhatsApp y Facebook.
                Automatiza tus ventas y atiende clientes 24/7.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces rápidos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/productos" className="hover:text-white transition-colors">Catálogo</Link></li>
                <li><Link href="/carrito" className="hover:text-white transition-colors">Carrito</Link></li>
                <li><Link href="/chat" className="hover:text-white transition-colors">Chat IA</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp Business</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.046V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  <span>Facebook Messenger</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 mi_negocio. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      <CartSidebar />
      <ChatWidget />
    </div>
  );
}