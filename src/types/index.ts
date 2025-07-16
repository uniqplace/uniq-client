// Shared types used across epics

// 1. User (base)
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// 2. Creator/Seller (extends User fields, but not inheritance)
export interface Creator {
  id: string;
  name: string;
  avatar?: string;
  followers: number; // Can be a number or an array of followers
}

// 3. Product (depends on Creator)
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  creator: Creator;  // Changed from sellerId to seller object
  status: 'active' | 'sold' | 'inactive';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  location: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 4. Order (depends on Product, Address)
export interface Order {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

// 5. Payment (depends on Order)
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'credit_card' | 'paypal' | 'stripe';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: Date;
}

// 6. Address (used by Order)
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}