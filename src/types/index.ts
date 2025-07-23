// Shared types used across epics

// 1. User (base)
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: RoleType;
  bio?: string; // Optional field for user bio
  createdAt?: Date;
}

// 2. Creator/Seller (extends User fields, but not inheritance)
export interface Creator {
  id: string;
  name: string;
  avatar?: string;
  followers: number | User[]; // Can be a number or an array of followers
}

// 3. Product (depends on Creator)
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  categories: string[];
  creator: Creator;
  status: 'active' | 'sold' | 'inactive';
  CreationStatus: 'Define Your Product' | 'Manufacturer Preferences'|'Send to Marketplace'| 'Select Manufacturer' |'Agreement'|'Payment & Order'|'Trucking & Delivery'|'Delivery';
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
  creatorId: string;
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

// FormData for registration/login forms
export type RoleType = 'customer' | 'manufacturer' | 'creator' | 'admin';

export type RegisterFormData = {
  fullName: string;
  email: string;
  password: string;
  role: RoleType;
};

// 5. Filters (for product listing)
export interface Filters {
  category?: string;
  priceRange?: [number, number];
  creator?: string;
}



// 6. Address (used by Order)
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface SubCategory {
  _id: string;
  name: string;
  type: string;
  category: string;
  count?: number;
}

export interface BidOffer {
  bidRequestId: string,
  manufacturerId: string,
  price: number
  estimatedDelivery: string
  note?: string
  attachmentUrl?: string
}
export interface Category {
  _id: string;
  name: string;
}
export type CategoryFiltersType = string[];
