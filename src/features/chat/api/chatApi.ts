// Shared API request helper
// HTTP API calls for chat (ensure, threads, etc.)
import type { EnsureDirectBidReq, EnsureDirectBidRes, ListThreadsQuery , EnsureDirectProductReq,     // 👈 חדש
  EnsureDirectProductRes,  } from './chatApi.types';


async function apiRequest<T>(input: RequestInfo, init?: RequestInit, errorMessage?: string): Promise<T> {
  const res = await fetch(input, init);
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) {
    throw new Error(data?.message || errorMessage || 'API request failed');
  }
  return data;
}

// Delete a thread by threadId
export async function deleteThreadById(threadId: string): Promise<{ success: boolean }> {
  return apiRequest(
    `${import.meta.env.VITE_API_BASE_URL}/chat/threads/${threadId}`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    },
    'Failed to delete thread'
  );
}



export async function issueStreamToken(): Promise<{ apiKey: string; userId: string; token: string }> {
  return apiRequest(
    `${import.meta.env.VITE_API_BASE_URL}/stream/token`,
    { method: 'POST', credentials: 'include' },
    'Failed to issue stream token'
  );
}

export async function ensureDirectBid(body: EnsureDirectBidReq): Promise<EnsureDirectBidRes> {
  return apiRequest(
    `${import.meta.env.VITE_API_BASE_URL}/chat/ensure-direct-bid`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    'Failed to ensure direct chat'
  );
}

export async function selectThreadByCid(body: { cid: string }): Promise<any> {
  return apiRequest(
    `${import.meta.env.VITE_API_BASE_URL}/chat/${body.cid}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    },
    'Failed to ensure direct chat'
  );
}

export async function listThreads(query: ListThreadsQuery = {}) {
  const p = new URLSearchParams();
  if (query.archived !== undefined) p.set('archived', String(query.archived));
  if (query.page) p.set('page', String(query.page));
  if (query.limit) p.set('limit', String(query.limit));
  if (query.q) p.set('q', query.q);
  if (query.productId) p.set('productId', query.productId);   
  if (query.orderId) p.set('orderId', query.orderId);         
  if (query.bidRequestId) p.set('bidRequestId', query.bidRequestId); 
  if (query.bidOfferId) p.set('bidOfferId', query.bidOfferId);       

  return apiRequest(
    `${import.meta.env.VITE_API_BASE_URL}/chat/threads?${p.toString()}`,
    { credentials: 'include' },
    'Failed to list threads'
  );
}



export async function ensureDirectProduct(body: EnsureDirectProductReq): Promise<EnsureDirectProductRes> {
  return apiRequest(
    `${import.meta.env.VITE_API_BASE_URL}/chat/ensure-direct-product`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    'Failed to ensure product chat'
  );
}

const chatApi = {
  deleteThreadById,
  issueStreamToken,
  ensureDirectBid,
  ensureDirectProduct,
  selectThreadByCid,
  listThreads,
};

export default chatApi;

