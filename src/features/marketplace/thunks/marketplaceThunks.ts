// Marketplace Thunks - all async actions for marketplace feature
// This file contains Redux Toolkit async thunks for API calls

import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../../services/api';

// Shared async thunk helper for API calls
async function asyncThunkHelper<T>(fn: () => Promise<any>, rejectWithValue: (v: any) => any, fallbackMsg: string, postProcess?: (data: any) => T): Promise<T | ReturnType<typeof rejectWithValue>> {
  try {
    const response = await fn();
    const data = response.data;
    return postProcess ? postProcess(data) : data;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : fallbackMsg);
  }
}

// Async thunk for fetching all products - used in marketplace listing
export const fetchProducts = createAsyncThunk(
  'marketplace/fetchProducts',
  async (_, { rejectWithValue }) =>
    asyncThunkHelper(() => api.getProducts(), rejectWithValue, 'Failed to fetch products')
);

// Async thunk for fetching single product by ID - used in product detail page
export const fetchProduct = createAsyncThunk(
  'marketplace/fetchProduct',
  async (productId: string, { rejectWithValue }) =>
    asyncThunkHelper(() => api.getProduct(productId), rejectWithValue, 'Failed to fetch product')
);

// Future thunk for fetching products by category
export const fetchProductsByCategory = createAsyncThunk(
  'marketplace/fetchProductsByCategory',
  async (category: string, { rejectWithValue }) =>
    asyncThunkHelper(
      () => api.getProducts(),
      rejectWithValue,
      'Failed to fetch products by category',
      (data) => data.filter((product: any) => product.category === category)
    )
);

// Future thunk for searching products
export const searchProducts = createAsyncThunk(
  'marketplace/searchProducts',
  async (searchTerm: string, { rejectWithValue }) =>
    asyncThunkHelper(
      () => api.getProducts(),
      rejectWithValue,
      'Failed to search products',
      (data) => data.filter((product: any) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
);
