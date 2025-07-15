import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../../services/api';

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

// Async thunk for fetching single product by ID - used in product detail page
export const fetchProduct = createAsyncThunk(
  'marketplace/fetchProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.getProduct(productId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch product');
    }
  }
);

export const fetchCreatorsAndManufacturers = createAsyncThunk(
  'marketplace/fetchCreatorsAndManufacturers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users/creators-and-manufacturers');
      if (!response.ok) {
        throw new Error('Failed to fetch creators and manufacturers');
      }
      const users = await response.json();
      return users;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch creators and manufacturers');
    }
  }
);