export type EnsureDirectBidReq = { bidRequestId: string; bidOfferId: string };
export type EnsureDirectBidRes = { cid: string; threadId: string };

/** חדש: פתיחת צ׳אט לפי מוצר */
export type EnsureDirectProductReq = {
  productId: string;
  sellerUserId: string;
  title?: string;
  participantsMeta?: Array<{ id: string; name?: string; image?: string; role?: string }>;
};
export type EnsureDirectProductRes = { cid: string; threadId: string };

/** הרחבה: סינונים אופציונליים לרשימת ת׳רדים */
export type ListThreadsQuery = {
  archived?: boolean;
  page?: number;
  limit?: number;
  q?: string;
  // חדשים:
  productId?: string;
  orderId?: string;
  // קיימים להקשר מכרז (אם תרצה לסנן גם שם מהקליינט):
  bidRequestId?: string;
  bidOfferId?: string;
};
