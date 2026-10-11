'use client';

import { CartPage } from '@/components/cart/Cart';
import { CartSidebar } from '@/components/cart/Cart';
import { ChatWidget } from '@/components/chat/ChatWidget';

export default function CarritoPage() {
  return (
    <>
      <CartPage />
      <CartSidebar />
      <ChatWidget />
    </>
  );
}