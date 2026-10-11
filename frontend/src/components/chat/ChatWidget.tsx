'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { aiApi } from '@/lib/api';
import type { ChatResponse } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response: ChatResponse = await aiApi.chat({
        channel: 'WEB',
        external_id: 'web_user_' + (localStorage.getItem('user_id') || Math.random().toString(36).substr(2, 9)),
        message: currentInput,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
        },
      ]);
      setConversationId(response.conversation_id);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Lo siento, hubo un error. Por favor intenta de nuevo.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openWhatsApp = () => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '521xxxxxxxxxx';
    const message = 'Hola, me gustaría información sobre sus productos';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const openFacebook = () => {
    window.open('https://m.me/tu_pagina', '_blank');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-105"
        aria-label="Abrir chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 w-full max-w-sm lg:max-w-md bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col overflow-hidden animate-slide-up',
          isOpen ? 'block' : 'hidden'
        )}
      >
        <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Asistente mi_negocio</h3>
              <p className="text-xs opacity-80">En línea - Responde en segundos</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">¡Hola! 👋 Soy tu asistente de ventas.</p>
              <p className="text-xs mt-1">¿En qué te puedo ayudar hoy?</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-2 max-w-[80%]',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'rounded-2xl px-4 py-2 text-sm',
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={cn('text-xs mt-1', msg.role === 'user' ? 'text-primary-100' : 'text-gray-400')}>
                    {formatDateTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-100 p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                rows={1}
                className="input pr-12 min-h-[44px] max-h-32 resize-none"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={openWhatsApp}>
              <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24">
                <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.472.099-.174.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414z" />
              </svg>
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={openFacebook}>
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.046V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export function ChatPage() {
  return (
    <div className="container-main py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Chat con Asistente IA</h1>
      <div className="card h-[600px] flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Conversación</h2>
          <p className="text-sm text-gray-500">Prueba el asistente de ventas</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <ChatWidget />
        </div>
      </div>
    </div>
  );
}