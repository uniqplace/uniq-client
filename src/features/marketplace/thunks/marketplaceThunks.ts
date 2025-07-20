import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../../services/api';

// Async thunk for fetching categories with counts
export const fetchCategoriesWithCounts = createAsyncThunk(
  'marketplace/fetchCategoriesWithCounts',
  async (_, { rejectWithValue }) =>
    asyncThunkHelper(
      () => api.getCategoriesWithCounts(),
      rejectWithValue,
      'Failed to fetch categories with counts',
      (res) => res
    )
);

// Shared async thunk helper for API calls
async function asyncThunkHelper<T>(fn: () => Promise<any>, rejectWithValue: (v: any) => any, fallbackMsg: string, postProcess?: (data: any) => T): Promise<T | ReturnType<typeof rejectWithValue>> {
  try {
    const response = await fn();
    if(response.data === undefined) {
      return response as T; // Handle cases where response is not in expected format
    }
    const data = response.data;
    return postProcess ? postProcess(data) : data;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : fallbackMsg);
  }
}

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
  'marketplace/fetchProducts',
  async (params: {
    q?: string;
    category?: string;
    creator?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await api.getProducts(params);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  }
);

// Async thunk for fetching single product by ID
export const fetchProduct = createAsyncThunk(
  'marketplace/fetchProduct',
  async (productId: string, { rejectWithValue }) =>
    asyncThunkHelper(
      () => api.getProduct(productId),
      rejectWithValue,
      'Failed to fetch product'
    )
);

// Async thunk for fetching creators and manufacturers
export const fetchCreatorsAndManufacturers = createAsyncThunk(
  'marketplace/fetchCreatorsAndManufacturers',
  async (_, { rejectWithValue }) =>
    asyncThunkHelper(
      () => api.getCreatorsAndManufacturers(),
      rejectWithValue,
      'Failed to fetch creators and manufacturers',
      (res) => res
    )
);
