// Delete a thread by threadId
export async function deleteThreadById(threadId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/threads/${threadId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j?.message || 'Failed to delete thread');
  }
  return res.json();
}
// HTTP API calls for chat (ensure, threads, etc.)

export type EnsureDirectBidReq = { bidRequestId: string; bidOfferId: string };
export type EnsureDirectBidRes = { cid: string; threadId: string };


export async function issueStreamToken(): Promise<{ apiKey: string; userId: string; token: string }> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stream/token`, { method: 'POST', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to issue stream token');
  return res.json();
}


export async function ensureDirectBid(body: EnsureDirectBidReq): Promise<EnsureDirectBidRes> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/ensure-direct-bid`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j?.message || 'Failed to ensure direct chat');
  }
  return res.json();
}
export async function selectThreadByCid(body: { cid: string }): Promise<any> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/${body.cid}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j?.message || 'Failed to ensure direct chat');
  }
  return res.json();
}

export type ListThreadsQuery = { archived?: boolean; page?: number; limit?: number; q?: string };
export async function listThreads(query: ListThreadsQuery = {}) {
  const p = new URLSearchParams();
  if (query.archived !== undefined) p.set('archived', String(query.archived));
  if (query.page) p.set('page', String(query.page));
  if (query.limit) p.set('limit', String(query.limit));
  if (query.q) p.set('q', query.q);
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/threads?${p.toString()}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to list threads');
  return res.json();
}

