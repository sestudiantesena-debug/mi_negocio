'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { signOut } from '@clerk/nextjs';
import { Button } from '@/components/ui';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Productos', href: '/admin/productos', icon: Package },
  { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingCart },
  { name: 'Conversaciones', href: '/admin/conversaciones', icon: MessageSquare },
  { name: 'IA Playground', href: '/admin/ia-playground', icon: Bot },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <Link href="/admin/dashboard" className="text-xl font-bold text-primary-600">
              mi_negocio Admin
            </Link>
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Navegación principal">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Administrador</p>
                <p className="text-xs text-gray-500 truncate">admin@mi_negocio.com</p>
              </div>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
                aria-label="Menú de usuario"
                aria-expanded={userMenuOpen}
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>

            {userMenuOpen && (
              <div className="mt-2 py-1 bg-gray-50 rounded-lg">
                <button
                  onClick={() => signOut({ redirectUrl: '/sign-in' })}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="h-5 w-5" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">mi_negocio Admin</h1>
            <div className="w-10" />
          </div>
        </header>

        <main className="p-4 lg:p-8" role="main">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}