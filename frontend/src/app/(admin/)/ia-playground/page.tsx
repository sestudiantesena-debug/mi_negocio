'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { aiApi } from '@/lib/api';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { Loader2, Bot, Send, Zap, Copy, Check, MessageSquare, Code, X } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

const TOOLS = [
  { name: 'search_products', description: 'Buscar productos por nombre, categoría o descripción', icon: '🔍' },
  { name: 'get_product_details', description: 'Obtener detalles completos de un producto', icon: '📋' },
  { name: 'create_draft_order', description: 'Crear borrador de orden con items seleccionados', icon: '🛒' },
  { name: 'get_order_status', description: 'Consultar estado de una orden existente', icon: '📦' },
  { name: 'handoff_to_human', description: 'Transferir a agente humano', icon: '👤' },
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: any[];
  timestamp: Date;
}

export default function IAPlaygroundPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [channel, setChannel] = useState<'WEB' | 'WHATSAPP' | 'FACEBOOK'>('WEB');
  const [showTools, setShowTools] = useState(true);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
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
      const response = await aiApi.chat({
        channel,
        external_id: `playground_${channel.toLowerCase()}_${Date.now()}`,
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
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Error: ' + (error instanceof Error ? error.message : 'Error desconocido'),
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

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary-600" />
              IA Playground
            </h1>
            <p className="text-gray-500">Prueba el asistente de ventas con function calling</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={clearChat} disabled={messages.length === 0}>
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showTools}
                onChange={(e) => setShowTools(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Mostrar tools
            </label>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Card className="h-[700px] flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Chat de prueba</CardTitle>
                  <div className="flex items-center gap-2">
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value as any)}
                      className="input py-1.5 text-sm w-auto"
                    >
                      <option value="WEB">🌐 Web</option>
                      <option value="WHATSAPP">💬 WhatsApp</option>
                      <option value="FACEBOOK">📘 Facebook</option>
                    </select>
                    {conversationId && (
                      <Badge variant="gray">Conv: #{conversationId}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <Bot className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">¡Hola! Soy tu asistente de ventas IA</p>
                      <p className="text-sm mt-1">Pregúntame por productos, crea órdenes o consulta estados</p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                        {[
                          'Buscar camisetas',
                          'Ver detalles del producto 1',
                          'Crear orden con 2 camisetas',
                          'Estado de orden MN-20240115-001',
                        ].map((suggestion, i) => (
                          <Button key={i} variant="ghost" size="sm" className="text-xs" onClick={() => { setInput(suggestion); sendMessage(); }}>
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={cn('flex gap-2 max-w-[85%]', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                        <div className={cn('rounded-2xl px-4 py-3 max-w-[85%]', msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-md' : msg.role === 'assistant' ? 'bg-gray-100 text-gray-900 rounded-bl-md' : 'bg-yellow-50 text-gray-900 border border-yellow-200 rounded-bl-md')}>
                          <div className="flex items-start gap-2">
                            <div className={cn('flex-shrink-0 mt-0.5', msg.role === 'user' ? 'text-primary-200' : msg.role === 'assistant' ? 'text-gray-400' : 'text-yellow-500')}>
                              {msg.role === 'user' ? <MessageSquare className="h-4 w-4" /> : msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                            </div>
                            <div className="flex-1">
                              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                              {msg.toolCalls && msg.toolCalls.length > 0 && showTools && (
                                <div className="mt-2 space-y-1">
                                  {msg.toolCalls.map((tc: any, i: number) => (
                                    <div key={i} className="text-xs bg-white/50 rounded px-2 py-1 font-mono">
                                      <span className="font-medium">{tc.function?.name || 'tool'}</span>({tc.function?.arguments || '{}'})
                                    </div>
                                  ))}
                                </div>
                              )}
                              <p className={cn('text-xs mt-1', msg.role === 'user' ? 'text-primary-100' : 'text-gray-400')}>
                                {formatDateTime(msg.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  <div id="chat-end" />
                </div>

                <div className="border-t border-gray-100 p-4">
                  <div className="flex gap-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Escribe tu mensaje..."
                      rows={1}
                      className="input flex-1 min-h-[44px] max-h-32 resize-none"
                      disabled={isLoading}
                    />
                    <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="lg">
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary-600" />
                  Tools disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {TOOLS.map((tool) => (
                    <div key={tool.name} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary-200 transition-colors">
                      <div className="flex items-start gap-2">
                        <span className="text-2xl">{tool.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{tool.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{tool.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary-600" />
                  System Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono max-h-64 overflow-auto">
                  {`Eres un asistente de ventas inteligente para "mi_negocio"...
                  
Funciones disponibles:
- search_products(query, category?, max_price?, limit?)
- get_product_details(product_id)
- create_draft_order(items[], customer_name, customer_phone, customer_email?)
- get_order_status(order_number)
- handoff_to_human(reason, summary)

Reglas:
1. NO inventes precios ni stock
2. Confirma antes de crear orden
3. Escala a humano si no puedes resolver`}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}