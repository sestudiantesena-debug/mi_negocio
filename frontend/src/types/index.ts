export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  images: string[];
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  channel: ChannelType;
  customer_id: number;
  items: OrderItem[];
  total: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
  metadata: Record<string, unknown>;
}

export interface Customer {
  id: number;
  external_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  channel: ChannelType;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PENDING_PAYMENT';

export type ChannelType = 'WHATSAPP' | 'FACEBOOK' | 'WEB' | 'INSTAGRAM';

export interface Conversation {
  id: number;
  channel: ChannelType;
  external_id: string;
  customer_id: number | null;
  status: ConversationStatus;
  context: Record<string, unknown>;
  assigned_agent_id: number | null;
  created_at: string;
  updated_at: string;
  last_message?: string;
  message_count: number;
}

export type ConversationStatus = 'ACTIVE' | 'CLOSED' | 'ESCALATED' | 'BOT' | 'HUMAN';

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls: unknown[] | null;
  tool_call_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ConversationListResponse {
  items: Conversation[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ConversationDetailResponse extends Conversation {
  messages: Message[];
}

export interface ChatRequest {
  channel: ChannelType;
  external_id: string;
  message: string;
  customer_name?: string;
  customer_phone?: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: number;
}

export interface OrderCreate {
  channel: ChannelType;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  customer_external_id: string;
  items: OrderItemCreate[];
  metadata?: Record<string, unknown>;
}

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface ApiError {
  error: {
    message: string;
    details?: unknown;
    path: string;
  };
}