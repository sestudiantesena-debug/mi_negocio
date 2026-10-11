'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ordersApi, type Order, type OrderStatus } from '@/lib/api';
import { Button, Badge } from '@/components/ui';
import { formatCurrency, getOrderStatusColor, getChannelIcon } from '@/lib/utils';
import { Loader2, Search, Filter, X, Eye, Truck, CheckCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'PENDING_PAYMENT', label: 'Pendiente pago' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'PROCESSING', label: 'Procesando' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'REFUNDED', label: 'Reembolsado' },
];

const channelOptions = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'WEB', label: 'Web' },
  { value: 'INSTAGRAM', label: 'Instagram' },
];

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await ordersApi.list({
        page,
        page_size: pageSize,
        status: selectedStatus || undefined,
        channel: selectedChannel as any || undefined,
        search: searchQuery || undefined,
      });
      setOrders(response.items);
      setTotal(response.total);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    try {
      await ordersApi.update(order.id, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error al actualizar el estado');
    }
  };

  const handleConfirmPayment = async (orderNumber: string) => {
    if (!confirm('¿Confirmar que el pago fue recibido?')) return;
    try {
      await ordersApi.confirmPayment(orderNumber);
      fetchOrders();
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Error al confirmar el pago');
    }
  };

  const hasActiveFilters = searchQuery || selectedStatus || selectedChannel;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedChannel('');
    setPage(1);
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const flow: OrderStatus[] = ['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const idx = flow.indexOf(current);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
            <p className="text-gray-500">{total} pedidos en total</p>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar por número de orden, cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className="input w-full sm:w-48"
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
              <p className="text-gray-500">Cargando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron pedidos</h3>
              <p className="text-gray-500">Intenta ajustar los filtros</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b border-gray-100 bg-gray-50">
                      <th className="p-4 font-medium">Orden</th>
                      <th className="p-4 font-medium">Cliente</th>
                      <th className="p-4 font-medium">Canal</th>
                      <th className="p-4 font-medium">Items</th>
                      <th className="p-4 font-medium">Total</th>
                      <th className="p-4 font-medium">Estado</th>
                      <th className="p-4 font-medium">Fecha</th>
                      <th className="p-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id} className={cn('hover:bg-gray-50', expandedOrder === order.id && 'bg-primary-50')}>
                        <td className="p-4">
                          <span className="font-mono text-sm font-medium text-gray-900">{order.order_number}</span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-gray-900">{order.customer_id}</p>
                            <p className="text-sm text-gray-500">ID: {order.customer_id}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            {getChannelIcon(order.channel)} {order.channel}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{order.items.length} productos</td>
                        <td className="p-4 font-semibold text-gray-900">{formatCurrency(order.total)}</td>
                        <td className="p-4">
                          <Badge className={getOrderStatusColor(order.status)}>
                            {statusOptions.find(s => s.value === order.status)?.label || order.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                              className="input py-1.5 text-xs"
                            >
                              {statusOptions.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>
                            {order.status === 'PENDING_PAYMENT' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleConfirmPayment(order.order_number)}
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedOrder === order.id && (
                        <tr className="bg-primary-50">
                          <td colSpan={8} className="p-4">
                            <div className="ml-4 space-y-3 border-l-2 border-primary-200 pl-4">
                              <div className="font-medium text-gray-900">Detalles del pedido</div>
                              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Items:</p>
                                  <ul className="space-y-1">
                                    {order.items.map((item, i) => (
                                      <li key={i} className="flex justify-between">
                                        <span>{item.product.name} x{item.quantity}</span>
                                        <span className="font-medium">{formatCurrency(item.total_price)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-gray-500">Cliente ID:</p>
                                  <p className="font-medium">{order.customer_id}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Canal:</p>
                                  <p className="font-medium capitalize">{order.channel.toLowerCase()}</p>
                                </div>
                              </div>
                              {order.metadata && Object.keys(order.metadata).length > 0 && (
                                <div>
                                  <p className="text-gray-500 text-sm">Metadatos:</p>
                                  <pre className="text-xs bg-gray-100 p-2 rounded max-h-32 overflow-auto">
                                    {JSON.stringify(order.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, total)} de {total} pedidos
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
                  <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}