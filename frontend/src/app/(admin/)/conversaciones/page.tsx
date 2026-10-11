'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { conversationsApi, type Conversation, type ConversationStatus, type ChannelType } from '@/lib/api';
import { Button, Badge, Modal } from '@/components/ui';
import { formatDateTime, getConversationStatusColor, getChannelIcon } from '@/lib/utils';
import { Loader2, Search, Filter, X, MessageSquare, User, Bot, AlertTriangle, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusOptions: { value: ConversationStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Activas' },
  { value: 'BOT', label: 'Bot' },
  { value: 'HUMAN', label: 'Humano' },
  { value: 'ESCALATED', label: 'Escaladas' },
  { value: 'CLOSED', label: 'Cerradas' },
];

const channelOptions = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'WEB', label: 'Web' },
];

export default function AdminConversacionesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ConversationStatus | ''>('');
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const response = await conversationsApi.list({
        page,
        page_size: pageSize,
        status: selectedStatus || undefined,
        channel: selectedChannel as ChannelType || undefined,
      });
      setConversations(response.items);
      setTotal(response.total);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversationDetail = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setDetailLoading(true);
    setDetailModalOpen(true);
    try {
      const detail = await conversationsApi.get(conversation.id);
      setMessages(detail.messages || []);
    } catch (error) {
      console.error('Error fetching conversation detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;
    setSending(true);
    try {
      await conversationsApi.addMessage(selectedConversation.id, {
        role: 'assistant',
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: newMessage.trim(), created_at: new Date().toISOString() }]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTakeover = async () => {
    if (!selectedConversation) return;
    try {
      await conversationsApi.update(selectedConversation.id, { status: 'HUMAN', assigned_agent_id: 1 });
      fetchConversations();
      setSelectedConversation({ ...selectedConversation, status: 'HUMAN' });
    } catch (error) {
      console.error('Error taking over:', error);
    }
  };

  const handleEscalate = async () => {
    if (!selectedConversation) return;
    const reason = prompt('Razón de la escalación:');
    if (!reason) return;
    try {
      await conversationsApi.escalate(selectedConversation.id, reason);
      fetchConversations();
      setDetailModalOpen(false);
    } catch (error) {
      console.error('Error escalating:', error);
    }
  };

  const handleClose = async () => {
    if (!selectedConversation) return;
    try {
      await conversationsApi.update(selectedConversation.id, { status: 'CLOSED' });
      fetchConversations();
      setDetailModalOpen(false);
    } catch (error) {
      console.error('Error closing:', error);
    }
  };

  const hasActiveFilters = searchQuery || selectedStatus || selectedChannel;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedChannel('');
    setPage(1);
  };

  useEffect(() => {
    fetchConversations();
  }, [page, selectedStatus, selectedChannel, searchQuery]);

  useEffect(() => {
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Conversaciones</h1>
            <p className="text-gray-500">{total} conversaciones totales</p>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar por cliente, ID externo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ConversationStatus)}
              className="input w-full sm:w-40"
            >
              <option value="">Todos los estados</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="input w-full sm:w-40"
            >
              <option value="">Todos los canales</option>
              {channelOptions.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="whitespace-nowrap">
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
              <p className="text-gray-500">Cargando conversaciones...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron conversaciones</h3>
              <p className="text-gray-500">Intenta ajustar los filtros</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b border-gray-100 bg-gray-50">
                      <th className="p-4 font-medium">Cliente</th>
                      <th className="p-4 font-medium">Canal</th>
                      <th className="p-4 font-medium">Estado</th>
                      <th className="p-4 font-medium">Último mensaje</th>
                      <th className="p-4 font-medium">Actualizado</th>
                      <th className="p-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {conversations.map((conv) => (
                      <tr key={conv.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => fetchConversationDetail(conv)}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{conv.external_id}</p>
                              <p className="text-sm text-gray-500">ID: {conv.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            {getChannelIcon(conv.channel)} {conv.channel}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge className={getConversationStatusColor(conv.status)}>
                            {statusOptions.find(s => s.value === conv.status)?.label || conv.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                          {conv.last_message || 'Sin mensajes'}
                        </td>
                        <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatDateTime(conv.updated_at)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <button
                                onClick={(e) => { e.stopPropagation(); setActionMenuOpen(actionMenuOpen === conv.id ? null : conv.id); }}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
                              >
                                <MoreVertical className="h-5 w-5" />
                              </button>
                              {actionMenuOpen === conv.id && (
                                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleTakeover(); setActionMenuOpen(null); }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <User className="h-4 w-4 mr-2 inline" />
                                    Tomar control
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleEscalate(); setActionMenuOpen(null); }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-2 inline" />
                                    Escalar
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleClose(); setActionMenuOpen(null); }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2 inline" />
                                    Cerrar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, total)} de {total} conversaciones
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
                  <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setSelectedConversation(null); setMessages([]); }}
        title={selectedConversation ? `Conversación #${selectedConversation.id}` : 'Detalle'}
        size="xl"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : selectedConversation ? (
          <div className="flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('h-2 w-2 rounded-full', selectedConversation.status === 'ACTIVE' ? 'bg-green-500' : selectedConversation.status === 'BOT' ? 'bg-blue-500' : selectedConversation.status === 'HUMAN' ? 'bg-purple-500' : selectedConversation.status === 'ESCALATED' ? 'bg-red-500' : 'bg-gray-500')} />
                <div>
                  <p className="font-medium text-gray-900">{selectedConversation.external_id}</p>
                  <p className="text-sm text-gray-500">{getChannelIcon(selectedConversation.channel)} {selectedConversation.channel} • {statusOptions.find(s => s.value === selectedConversation.status)?.label}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedConversation.status !== 'HUMAN' && selectedConversation.status !== 'CLOSED' && (
                  <Button size="sm" onClick={handleTakeover}>
                    <User className="h-4 w-4 mr-1" />
                    Tomar control
                  </Button>
                )}
                {selectedConversation.status !== 'ESCALATED' && selectedConversation.status !== 'CLOSED' && (
                  <Button size="sm" variant="outline" onClick={handleEscalate}>
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Escalar
                  </Button>
                )}
                {selectedConversation.status !== 'CLOSED' && (
                  <Button size="sm" variant="outline" onClick={handleClose}>
                    Cerrar
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" id="messages-container">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay mensajes en esta conversación</p>
                </div>
              ) : (
                messages.map((msg: any, i: number) => (
                  <div key={i} className={cn('flex gap-2 max-w-[80%]', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn('rounded-2xl px-4 py-2 text-sm', msg.role === 'user' ? 'bg-primary-600 text-white rounded-br-md' : msg.role === 'assistant' ? 'bg-gray-100 text-gray-900 rounded-bl-md' : 'bg-yellow-100 text-gray-900 rounded-bl-md')}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className={cn('text-xs mt-1', msg.role === 'user' ? 'text-primary-100' : 'text-gray-400')}>
                        {msg.created_at ? formatDateTime(msg.created_at) : ''}
                      </p>
                    </div>
                  </div>
                ))}
              )}
              <div id="messages-end" />
            </div>

            <div className="border-t border-gray-100 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Escribe una respuesta..."
                  className="input flex-1"
                  disabled={!selectedConversation || selectedConversation.status === 'CLOSED'}
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim() || sending || !selectedConversation || selectedConversation.status === 'CLOSED'}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Responderás como agente humano. La IA está pausada para esta conversación.
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </AdminLayout>
  );
}