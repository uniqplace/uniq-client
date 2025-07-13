// Marketplace Thunks - all async actions for marketplace feature
// This file contains Redux Toolkit async thunks for API calls

import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../../services/api';

// Async thunk for fetching all products - used in marketplace listing
export const fetchProducts = createAsyncThunk(
  'marketplace/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getProducts();
      return response.data;
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

// Future thunk for fetching products by category
export const fetchProductsByCategory = createAsyncThunk(
  'marketplace/fetchProductsByCategory',
  async (category: string, { rejectWithValue }) => {
    try {
      // This would call a category-specific endpoint when available
      const response = await api.getProducts();
      // Filter by category on frontend for now
      const filteredProducts = response.data.filter(product => product.category === category);
      return filteredProducts;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch products by category');
    }
  }
);

// Future thunk for searching products
export const searchProducts = createAsyncThunk(
  'marketplace/searchProducts',
  async (searchTerm: string, { rejectWithValue }) => {
    try {
      // This would call a search endpoint when available
      const response = await api.getProducts();
      // Filter by search term on frontend for now
      const searchResults = response.data.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return searchResults;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to search products');
    }
  }
);
