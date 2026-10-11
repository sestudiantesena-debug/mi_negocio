'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import {
  Package,
  ShoppingCart,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
} from 'lucide-react';

const stats = [
  {
    name: 'Productos',
    value: '124',
    change: '+12%',
    icon: Package,
    color: 'text-blue-600 bg-blue-100',
  },
  {
    name: 'Pedidos totales',
    value: '1,234',
    change: '+8%',
    icon: ShoppingCart,
    color: 'text-green-600 bg-green-100',
  },
  {
    name: 'Conversaciones',
    value: '567',
    change: '+23%',
    icon: MessageSquare,
    color: 'text-purple-600 bg-purple-100',
  },
  {
    name: 'Ingresos',
    value: '$125,430',
    change: '+15%',
    icon: DollarSign,
    color: 'text-orange-600 bg-orange-100',
  },
];

const recentOrders = [
  { id: 'MN-20240115-001', customer: 'María García', total: 1299, status: 'DELIVERED', date: '2024-01-15', channel: 'WHATSAPP' },
  { id: 'MN-20240115-002', customer: 'Carlos López', total: 899, status: 'SHIPPED', date: '2024-01-15', channel: 'FACEBOOK' },
  { id: 'MN-20240114-003', customer: 'Ana Martínez', total: 2499, status: 'PROCESSING', date: '2024-01-14', channel: 'WEB' },
  { id: 'MN-20240114-004', customer: 'Luis Rodríguez', total: 599, status: 'PENDING_PAYMENT', date: '2024-01-14', channel: 'WHATSAPP' },
  { id: 'MN-20240113-005', customer: 'Sofia Hernández', total: 3299, status: 'CONFIRMED', date: '2024-01-13', channel: 'INSTAGRAM' },
];

const aiMetrics = [
  { label: 'Automatización', value: '87%', icon: Bot, color: 'text-green-600' },
  { label: 'Tiempo respuesta IA', value: '1.2s', icon: Clock, color: 'text-blue-600' },
  { label: 'Escalaciones', value: '13%', icon: Users, color: 'text-orange-600' },
  { label: 'Satisfacción', value: '4.8/5', icon: CheckCircle, color: 'text-purple-600' },
];

export default function DashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Resumen de tu negocio en tiempo real</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-green-600 font-medium mt-1">{stat.change} vs mes anterior</p>
                  </div>
                  <div className={cn('p-3 rounded-xl', stat.color)}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pedidos recientes</CardTitle>
              <Badge variant="info">5 más recientes</Badge>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                      <th className="pb-3 font-medium">Orden</th>
                      <th className="pb-3 font-medium">Cliente</th>
                      <th className="pb-3 font-medium">Total</th>
                      <th className="pb-3 font-medium">Estado</th>
                      <th className="pb-3 font-medium">Canal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="py-3 text-sm font-medium text-gray-900">{order.id}</td>
                        <td className="py-3 text-sm text-gray-600">{order.customer}</td>
                        <td className="py-3 text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</td>
                        <td className="py-3">
                          <Badge variant={
                            order.status === 'DELIVERED' ? 'success' :
                            order.status === 'SHIPPED' ? 'info' :
                            order.status === 'PROCESSING' ? 'warning' :
                            order.status === 'PENDING_PAYMENT' ? 'danger' : 'default'
                          }>
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm text-gray-500">{order.channel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métricas de IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {aiMetrics.map((metric) => (
                  <div key={metric.label} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', metric.color.replace('text-', 'bg-').replace('600', '100'))}>
                        <metric.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Productos con stock bajo</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  { name: 'Auriculares Bluetooth', stock: 3, category: 'Electrónica' },
                  { name: 'Set Sartenes Antiadherentes', stock: 2, category: 'Hogar' },
                  { name: 'Crema Vitamina C', stock: 1, category: 'Belleza' },
                  { name: 'Drone Mini HD', stock: 0, category: 'Juguetes' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <Badge variant={item.stock === 0 ? 'danger' : 'warning'}>
                      Stock: {item.stock}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversaciones activas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  { client: 'Juan Pérez', channel: 'WHATSAPP', status: 'BOT', lastMsg: '¿Tienen en color azul?', time: 'hace 2 min' },
                  { client: 'María López', channel: 'FACEBOOK', status: 'HUMAN', lastMsg: 'Quiero hablar con alguien', time: 'hace 5 min' },
                  { client: 'Carlos Ruiz', channel: 'WEB', status: 'BOT', lastMsg: 'Precio del envío a CDMX', time: 'hace 10 min' },
                ].map((conv, i) => (
                  <li key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={cn('h-2 w-2 rounded-full', conv.status === 'BOT' ? 'bg-blue-500' : 'bg-purple-500')} />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{conv.client}</p>
                        <p className="text-xs text-gray-500">{conv.lastMsg}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={conv.channel === 'WHATSAPP' ? 'success' : conv.channel === 'FACEBOOK' ? 'info' : 'gray'} className="text-xs">
                        {conv.channel}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{conv.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <a href="/admin/productos/nuevo" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <p className="font-medium text-gray-900">➕ Nuevo producto</p>
                  <p className="text-sm text-gray-500">Añadir al catálogo</p>
                </a>
                <a href="/admin/pedidos?status=PENDING_PAYMENT" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <p className="font-medium text-gray-900">💳 Pedidos pendientes de pago</p>
                  <p className="text-sm text-gray-500">Revisar y confirmar</p>
                </a>
                <a href="/admin/conversaciones?status=ESCALATED" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <p className="font-medium text-gray-900">👥 Conversaciones escaladas</p>
                  <p className="text-sm text-gray-500">Atender a clientes</p>
                </a>
                <a href="/admin/ia-playground" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <p className="font-medium text-gray-900">🤖 Probar IA</p>
                  <p className="text-sm text-gray-500">Testear respuestas</p>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

import { Bot } from 'lucide-react';