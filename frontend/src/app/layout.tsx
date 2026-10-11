import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'mi_negocio - Tu tienda con IA',
  description: 'Plataforma de e-commerce con automatización conversacional para WhatsApp y Facebook',
  keywords: ['ecommerce', 'whatsapp', 'facebook', 'chatbot', 'ia', 'ventas'],
  authors: [{ name: 'mi_negocio' }],
  openGraph: {
    title: 'mi_negocio',
    description: 'Tu tienda inteligente con asistente de ventas IA',
    type: 'website',
    locale: 'es_MX',
    siteName: 'mi_negocio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mi_negocio',
    description: 'Plataforma de e-commerce con IA conversacional',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="es" className={inter.variable}>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body className="min-h-screen bg-gray-50">
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: { background: '#363636', color: '#fff' },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}