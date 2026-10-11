'use client';

import { ChatWidget, ChatPage } from '@/components/chat/ChatWidget';
import { CartSidebar } from '@/components/cart/Cart';

export default function ChatPageWeb() {
  return (
    <>
      <ChatPage />
      <CartSidebar />
      <ChatWidget />
    </>
  );
}