// Shared types used across epics

// 1. User (base)
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: RoleType;
  bio?: string;
  skills?: string[];
  servicesOffered?: string[]; 
  portfolio?: string[];
  createdAt?: Date;
}

// 2. Creator/Seller
export interface Creator {
  _id: string;
  name: string;
  avatar?: string;
  followers: number | User[];
}

// 3. Product
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  categories: string[];
  creator: Creator;
  status: 'active' | 'sold' | 'inactive';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  location: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 4. Order
export interface Order {
  id: string;
  productId: string;
  buyerId: string;
  creatorId: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: Address;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 5. Address (used by Order)
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// 6. Payment
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'credit_card' | 'paypal' | 'stripe';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: Date;
}

// 7. Role & Auth
export type RoleType = 'customer' | 'manufacturer' | 'creator' | 'admin';

export type RegisterFormData = {
  fullName: string;
  email: string;
  password: string;
  role: RoleType;
};

// 8. Filters (for product listing)
export interface Filters {
  category?: string;
  priceRange?: [number, number];
  creator?: string;
}

// 9. Sub-category
export interface SubCategory {
  _id: string;
  name: string;
  type: string;
  category: string;
  count?: number;
}

// 10. Category
export interface Category {
  _id: string;
  name: string;
}


// 11. Category Filters
export type CategoryFiltersType = string[];

// 12. BidOffer
export interface BidOffer {
  bidRequestId: string;
  manufacturerId: string;
  price: number;
  estimatedDelivery: string;
  note?: string;
  attachmentUrl?: string;
}
