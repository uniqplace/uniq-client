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
  CreationStatus?: 'Define Your Product' | 'Manufacturer Preferences' | 'Send to Marketplace' | 'View Live Bids' | 'Choose Manufacturer' | 'Agree to Terms' | 'Make Payment' | 'Track Delivery' | 'Complete Delivery';
  creator: Creator;
  category: Category;
  subCategories: SubCategory[];
  status: 'draft' | 'published' | 'hidden';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  location: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}


export interface Order {
  _id: string;
  productId: string;
  buyerId: string;
  creator: { name: string, _id: string };
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: Address;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
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

// Removed duplicate BidOffer interface with manufacturerId as string

// 10. Category
export interface Category {
  _id: string;
  name: string;
}

// Bid Manufacturer
export interface BidManufacturer {
  manufacturer: ManufacturerProfile; // ManufacturerProfile ID
  status: 'read' | 'unread';
}

// Bid Request
export interface BidRequest {
  _id: string;
  creatorId: string | User; // Creator ID or User object
  productId: Product | string; // Product ID or Product object
  categoryId: string | Category; // Category ID or Category object
  locationPreference: string;
  priceRange: { min: number; max: number };
  deliveryTimeframe: string;
  deliveryMethod: 'pickup' | 'shipping';
  status: 'open' | 'closed' | 'expired';
  manufacturers?: BidManufacturer[];
  createdAt: Date;
  updatedAt: Date;
  rating?: number;
}

export interface Filters {
  category: string;
  subCategories?: string[];
  priceRange: [number, number];
  searchTerm: string;
  creator: string;
}
// 11. Category Filters
export type CategoryFiltersType = string[];




interface UserToBidOffer {
  _id: string;
  name: string;
  avatarUrl?: string;
  email: string;
}

export interface Manufacturer {
  _id?: string;
  userId: UserToBidOffer;
  name: string;
  rating?: number;
  location?: string;
  availableFrom?: string;
  categories?: string[];
  servicesOffered?: string[];
}
interface BidRequestId {
  _id?: string;
  productId: ({ title: string }) & { _id?: string } & { description?: string }&{ images?: string[] };
  creatorId?: ({ name: string; email: string; role: string; avatarUrl?: string }) & { _id?: string };
  categoryId: string;
}

// 12. BidOffer
export interface BidOffer {
  _id?: string;
  bidRequestId: BidRequestId;
  manufacturerId: ManufacturerProfile; // Manufacturer can be an object or just an ID string
  price: number;
  estimatedDelivery: string;
  note?: string;
  attachmentUrl?: string;
  createdAt?: Date;
}

export interface ManufacturerProfile {
  _id: string;
  userId: User;
  name: string;
  categories: string[];
  location: string;
  availableFrom: string;
  rating?: number;
  servicesOffered?: string[];
}

