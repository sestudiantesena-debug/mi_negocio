import useSWR from 'swr';
import { conversationsApi } from '@/lib/api';
import type { Conversation, ConversationListResponse, ConversationDetailResponse } from '@/types';

export function useConversations(params?: {
  page?: number;
  page_size?: number;
  status?: string;
  channel?: string;
  customer_id?: number;
  assigned_agent_id?: number;
}) {
  const key = ['conversations', params];
  const { data, error, isLoading, mutate } = useSWR<ConversationListResponse>(
    key,
    () => conversationsApi.list(params),
    { revalidateOnFocus: false, dedupingInterval: 10000, refreshInterval: 30000 }
  );

  return {
    conversations: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pageSize: data?.page_size || 20,
    totalPages: data?.total_pages || 0,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useConversation(id: number) {
  const key = id ? ['conversation', id] : null;
  const { data, error, isLoading, mutate } = useSWR<ConversationDetailResponse>(
    key,
    () => conversationsApi.get(id!),
    { revalidateOnFocus: false, refreshInterval: 5000 }
  );

  return { conversation: data, isLoading, isError: !!error, error, mutate };
}