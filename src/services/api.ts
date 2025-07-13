// API Service Layer - handles all HTTP requests to the backend
// This centralizes all API calls and makes them reusable across components

import type { Product, User } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Generic API response interface to match your backend response format
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// API service object with all endpoint methods
export const api = {
  // Fetch all products from marketplace
  getProducts: async (): Promise<ApiResponse<Product[]>> => {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Fetch single product by ID - used for product detail page
  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Fetch user/creator profile by ID (for future use)
  getUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
};
