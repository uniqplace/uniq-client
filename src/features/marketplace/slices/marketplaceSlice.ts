// src/features/marketplace/marketplaceSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../../types';
import { fetchProducts, fetchProduct } from '../thunks';

interface Filters {
  category: string;
  priceRange: [number, number];
  searchTerm: string;
}

interface MarketplaceState {
  selectedProduct: Product | null;
  products: Product[];
  loading: boolean;
  error: string | null;
  productLoading: boolean;
  productError: string | null;
  filters: Filters;
}

const initialState: MarketplaceState = {
  selectedProduct: null,
  products: [],
  loading: false,
  error: null,
  productLoading: false,
  productError: null,
  filters: {
    category: '',
    priceRange: [0, 1000],
    searchTerm: '',
  },
};

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setSelectedProduct(state, action: PayloadAction<Product | null>) {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct(state) {
      state.selectedProduct = null;
      state.productError = null;
    },
    updateFilters(state, action: PayloadAction<Partial<Filters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = {
        category: '',
        priceRange: [0, 1000],
        searchTerm: '',
      };
    },
    addProduct(state, action: PayloadAction<Product>) {
      state.products.push(action.payload);
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const index = state.products.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    removeProduct(state, action: PayloadAction<string>) {
      state.products = state.products.filter(p => p._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchProduct.pending, (state) => {
        state.productLoading = true;
        state.productError = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.productLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.productLoading = false;
        state.productError = action.payload as string;
      });
  },
});

export const {
  setSelectedProduct,
  clearSelectedProduct,
  updateFilters,
  clearFilters,
  addProduct,
  updateProduct,
  removeProduct,
} = marketplaceSlice.actions;

export default marketplaceSlice.reducer;
