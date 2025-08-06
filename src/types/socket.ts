// Types for socket-related Redux state

export interface BidManufacturer {
  manufacturer: string; // ObjectId as string
  status: 'read' | 'unread';
}

export interface BidRequest {
  _id?: string;
  creatorId: string;
  productId: string;
  categoryId: string;
  locationPreference: string;
  priceRange: { min: number; max: number };
  deliveryTimeframe: string;
  deliveryMethod: 'pickup' | 'shipping';
  status: 'open' | 'closed' | 'expired';
  manufacturers: BidManufacturer[];
  createdAt: string;
  updatedAt: string;
}

export interface BidResponse {
  bidId: string;
  status: 'accepted' | 'rejected' | 'pending';
  message?: string;
  updatedAt?: string;
}

