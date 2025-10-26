// Types for socket-related Redux state

import type { Product } from ".";

export interface BidManufacturer {
  manufacturer: string; // ObjectId as string
  status: 'read' | 'unread';
}

export interface BidRequest {
  _id?: string;
  creatorId: string;
  productId: Product;
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

