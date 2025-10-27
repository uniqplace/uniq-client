// 1. User (base)
export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: RoleType;
  bio?: string; // Optional field for user bio
  createdAt?: Date;
  manufacturerId?: string;
  manufacturer?: ManufacturerProfile;
  creatorId?: string;
  creator?: CreatorProfile;
}

// 2. Creator/Seller
export interface Creator {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: RoleType;
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
  CreationStatus?: 'Define Your Product' | 'Manufacturer Preferences' | 'View Live Bids'  | 'Order & Payment' | 'Track Delivery' | 'Complete Delivery';
  creator: User;
  category: Category;
  subCategories: SubCategory[];
  status: 'draft' | 'published' | 'hidden';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  location: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  rating?: number;
  ratingCount?: number;
  sales?: number;
  stock?: number;
  createdByAI?: boolean;
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
  trackingNumber?: string; 
  shippingOption?: {
    label: 'Standard (5$)' | 'Express (15$)';
    value: 'standard' | 'express';
    price: 5 | 15;
  };
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
  notes?: string;
}

export const SHIPPING_OPTIONS = [
  { label: 'Standard (5$)', value: 'standard', price: 5 },
  { label: 'Express (15$)', value: 'express', price: 15 },
];

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

// 5. Address (used by Order)
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  [key: string]: string | undefined; // Ensure all keys are strings and values are strings or undefined
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
  productId: Product; // Product ID or Product object
  categoryId: string | Category; // Category ID or Category object
  locationPreference: string;
  priceRange: { min: number; max: number };
  deliveryTimeframe: string;
  deliveryMethod: 'pickup' | 'shipping';
  status: 'open' | 'closed' | 'expired';
  manufacturers?: BidManufacturer[];
  selectedManufacturer?: ManufacturerProfile; // Manufacturer can be an object or just an ID string
  createdAt: Date;
  updatedAt: Date;
  rating?: number;
  orderId?: string;
}



export interface Filters {
  category: string;
  subCategories?: string[];
  priceRange: [number, number];
  searchTerm: string;
  creator: string;
  rating?: number | null;
}
// 11. Category Filters
export type CategoryFiltersType = string[];

export interface BidRequestId {
  _id?: string;
  productId: ({ title: string }) & { _id?: string } & { description?: string } & { images?: string[] };
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
  _id?: string;
  userId: User;
  name: string;
  phone: string;
  categories: string[] | Category[];
  location: string;
  availableFrom: string;
  rating?: number;
  servicesOffered?: string[];
  ratingCount?: number;
  createdAt?: Date;
}

export interface CreatorProfile {
  _id?: string;
  userId: string;
  name: string;
  categories: string[] | Category[];
  location: string;
  phone: string;
  rating: number;
  ratingCount: number;
  createdAt?: Date;
}

type ParamStatus = "confirmed" | "missing" | "skipped"; 
type ParamSource = "ai" | "user";                      
type ParamType = "text" | "number" | "boolean" | "color" | "enum" | "file" | "date";

interface ProductParam {
  id: string;                 
  label: string;            
  type: ParamType;
  requiredByAI: boolean;     
  status: ParamStatus;        
  value?: any;               
  unit?: string;              
  enumOptions?: string[];    
  source: ParamSource;       
  skipConfirmation?: {    
    confirmed: true;
    confirmedAt: string;    
    reason?: string;
  };
  notes?: string;            
  validation?: { valid: boolean; issues?: string[] }; 
}

export interface ProductPayload {
  sessionId: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  creator?: any;
  category?: any; 
  subCategories: any[]; 
  status: "idle" | "draft" | "drafting" | "refining" | "validating" | "locked" | "error" | "published" | "hidden";
  condition: "new" | "like_new" | "good" | "fair" | "poor";
  location: string;
  tags: string[];
  params: ProductParam[];
  audit: any[];
  summary?: any;
  aiVersion?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdByAI?: boolean; 
}




