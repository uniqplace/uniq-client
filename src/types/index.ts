// Shared types used across epics
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Creator/Seller interface - represents the person selling the product
export interface Creator {
  id: string;
  name: string;
  avatarUrl?: string;
}

// Updated Product interface to match backend structure
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  seller: Creator;  // Changed from sellerId to seller object
  status: 'active' | 'sold' | 'inactive';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';  // Added condition field
  location: string;  // Added location field
  tags: string[];   // Added tags field
  createdAt: Date;
  updatedAt: Date;
}

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

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'credit_card' | 'paypal' | 'stripe';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: Date;
} 