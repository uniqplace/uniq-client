// API Service Layer - handles all HTTP requests to the backend
// This centralizes all API calls and makes them reusable across components


import type { Category, Product } from '../types';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Generic API response interface to match your backend response format
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  totalPages?: number; // Optional for paginated responses
}

// Centralized API error handler
function handleError(status: number, message?: string) {
  if (status === 401) {
    // TODO: Implement user-facing error handling (e.g., redirect to login or show a toast)
    // e.g. redirect to login in the future
  }
  console.error(`API error ${status}: ${message}`);
}

// Reusable GET helper
async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      const errorText = await response.text();
      handleError(response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    const json = await response.json();
    return json;
  } catch (error: any) {
    // Handle network errors (offline, CORS, etc.)
    handleError(0, error?.message || 'Network error');
    throw new Error(error?.message || 'Network error');
  }
}

const logoutApi = async () => {
  return axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
};

export const api = {

  // Fetch single product by ID - used for product detail page
  getProduct: async (id: string): Promise<ApiResponse<Product>> => {
    return get<Product>(`/products/${id}`);
  },

  // Fetch creators and manufacturers
  getCreatorsAndManufacturers: async (): Promise<ApiResponse<{ _id: string; name: string; avatar?: string }>> => {
    return await get<{ _id: string; name: string; avatar?: string }>(`/users/creatorsAndManufacturers`);
  },


  logoutApi,

  // Fetch all subCategories
  getSubCategories: async (): Promise<ApiResponse<Category[]>> => {
    return await get<Category[]>(`/subcategories`);
  },

};
