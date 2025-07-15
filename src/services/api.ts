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

// API service object with all endpoint methods
export const api = {
  getProducts: () => get<Product[]>('/products'),
  getProduct: (id: string) => get<Product>(`/products/${id}`),
  getUser: (id: string) => get<User>(`/users/${id}`),
};
