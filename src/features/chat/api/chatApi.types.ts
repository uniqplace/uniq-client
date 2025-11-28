export type EnsureDirectBidReq = { bidRequestId: string; bidOfferId: string };
export type EnsureDirectBidRes = { cid: string; threadId: string };

/** New: open chat by product */
export type EnsureDirectProductReq = {
  productId: string;
  sellerUserId: string;
  title?: string;
  participantsMeta?: Array<{ id: string; name?: string; image?: string; role?: string }>;
};
export type EnsureDirectProductRes = { cid: string; threadId: string };

/** Extension: optional filters for thread list */
export type ListThreadsQuery = {
  archived?: boolean;
  page?: number;
  limit?: number;
  q?: string;
  // New:
  productId?: string;
  orderId?: string;
  // Existing for bid context (if you want to filter also from client):
  bidRequestId?: string;
  bidOfferId?: string;
};
