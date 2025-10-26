// Type definitions for chatApi

export type EnsureDirectBidReq = { bidRequestId: string; bidOfferId: string };
export type EnsureDirectBidRes = { cid: string; threadId: string };
export type ListThreadsQuery = { archived?: boolean; page?: number; limit?: number; q?: string };
