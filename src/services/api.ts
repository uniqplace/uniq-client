
// API Service Layer - handles all HTTP requests to the backend
// This centralizes all API calls and makes them reusable across components

import type { Product } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Generic API response interface to match your backend response format
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Centralized API error handler
function handleError(status: number, message?: string) {
  if (status === 401) {
    // e.g. redirect to login in the future
  }
  console.error(`API error ${status}: ${message}`);
}

// Reusable GET helper
async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    const errorText = await response.text();
    handleError(response.status, errorText);
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  const json = await response.json();
  return json;
}

export const api = {
  getProducts: async (params: {
    q?: string;
    category?: string;
    creator?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.category) query.append('category', params.category);
    if (params.creator) query.append('creator', params.creator);
    if (typeof params.minPrice === 'number') query.append('minPrice', params.minPrice.toString());
    if (typeof params.maxPrice === 'number') query.append('maxPrice', params.maxPrice.toString());
    if (params.page) query.append('page', params.page.toString());

    const url = `${API_BASE_URL}/products/search?${query.toString()}`;
    const response = await fetch(url);
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
};
