// src/features/marketplace/marketplaceSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Category, Product } from '../../../types';
import { fetchProducts, fetchProduct } from '../thunks';
import { fetchCreatorsAndManufacturers, fetchCategoriesWithCounts } from '../thunks/marketplaceThunks';

interface Filters {
  category: string[];
  priceRange: [number, number];
  searchTerm: string;
  creator: string;
}

interface MarketplaceState {
  selectedProduct: Product | null;
  products: Product[];
  loading: boolean;
  error: string | null;
  productLoading: boolean;
  productError: string | null;
  filters: {
    category: string[];
    creator: string;
    priceRange: [number, number];
    searchTerm: string;
  };
  totalPages: number;
  creators: Array<{ label: string; value: string; avatar?: string }>;
  categories: Category[];
  maxPrice?: number;
}

const initialState: MarketplaceState = {
  selectedProduct: null,
  products: [],
  loading: false,
  error: null,
  productLoading: false,
  productError: null,
  filters: {
    creator: '',
    category: [],
    priceRange: [0, 1000],
    searchTerm: '',
  },
  totalPages: 1,
  creators: [{ label: 'All', value: '' }],
  categories: [],
  maxPrice: Number.NEGATIVE_INFINITY,
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
        category: [],
        priceRange: [0, 1000],
        searchTerm: '',
        creator: '',
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
    setCreators: (state, action: PayloadAction<Array<{ label: string; value: string; avatar?: string }>>) => {
      state.creators = action.payload;
    },
    setMaxPrice: (state, action: PayloadAction<number>) => {
      state.maxPrice = action.payload;
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
        if (Array.isArray(action.payload?.data)) {
          state.products = action.payload.data;
          state.totalPages = action.payload.totalPages || 1;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCreatorsAndManufacturers.fulfilled, (state, action) => {
        const users = Array.isArray(action.payload) ? action.payload : [];
        const creatorOptions = users.map((user: { _id: string; name: string; avatar?: string }) => ({
          label: user.name,
          value: user._id,
          avatar: user.avatar
        }));
        state.creators = [{ label: 'All', value: '' }, ...creatorOptions];
      })
      .addCase(fetchCategoriesWithCounts.fulfilled, (state, action) => {
        if (action.payload) {
          state.categories = action.payload;
        } else if (action.payload?.data) {
          state.categories = action.payload.data;
        }
      })
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