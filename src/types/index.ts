// 1. User (base)
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: RoleType;
  bio?: string; // Optional field for user bio
  createdAt?: Date;
}

// 2. Creator/Seller
export interface Creator {
  _id: string;
  name: string;
  avatarUrl?: string;
  followers: number | User[];
}

// 3. Product
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  CreationStatus?: 'Define Your Product' | 'Manufacturer Preferences'|'Send to Marketplace'| 'Select Manufacturer' |'Agreement'|'Payment & Order'|'Trucking & Delivery'|'Delivery';
  //categories: string[];
  creator: Creator;
  //status: 'active' | 'sold' | 'inactive';
  category: Category;
  subCategories: SubCategory[];
  status: 'draft' | 'published' | 'hidden';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  location: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}


// 4. Order
// export interface Order {
//   id: string;
//   productId: string;
//   buyerId: string;
//   creatorId: string;
//   status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
//   totalAmount: number;
//   paymentMethod: string;
//   shippingAddress: Address;
//   notes?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

export interface Order {
  id: string;
  productId: string;
  buyerId: string;
  creator: {name:string, _id:string};
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
  product: {
    _id: string;
    title: string;
    images: string[];
    creatorName: string;
  },
  notes?: string; 
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
 
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

// 6. Address (used by Order)
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// 9. Sub-category
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

// 10. Category
export interface Category {
  _id: string;
  name: string;
}

export interface BidRequest {
  _id: string;
  productId:  Product;
  categoryId: {id:string, name:string};
  locationPreference: string;
  status: 'open' | 'expired' | 'closed';
  createdAt: Date;
  deliveryTimeframe : string;
}

export interface Filters {
  category: string;
  subCategories?: string[];
  priceRange: [number, number];
  searchTerm: string;
  creator: string;
}

// 12. BidOffer
export interface BidOffer {
  bidRequestId: string;
  manufacturerId: string;
  price: number;
  estimatedDelivery: string;
  note?: string;
  attachmentUrl?: string;
}

