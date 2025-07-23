import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../../services/api';

export const fetchSubCategories = createAsyncThunk(
  'marketplace/fetchSubCategories',
  async (_, { rejectWithValue }) =>
    asyncThunkHelper(
      () => api.getSubCategories(),
      rejectWithValue,
      'Failed to fetch subcategories',
      (res) => res
    )
);

async function asyncThunkHelper<T>(fn: () => Promise<any>, rejectWithValue: (v: any) => any, fallbackMsg: string, postProcess?: (data: any) => T): Promise<T | ReturnType<typeof rejectWithValue>> {
  try {
    const response = await fn();
    if(response.data === undefined) {
      return response as T;
    }
    const data = response.data;
    return postProcess ? postProcess(data) : data;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : fallbackMsg);
  }
}

export const fetchProducts = createAsyncThunk(
  'marketplace/fetchProducts',
  async (params: {
    q?: string;
    category?: string;
    subCategories?: string[];
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

export const fetchProduct = createAsyncThunk(
  'marketplace/fetchProduct',
  async (productId: string, { rejectWithValue }) =>
    asyncThunkHelper(
      () => api.getProduct(productId),
      rejectWithValue,
      'Failed to fetch product'
    )
);

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
