import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../../types';
import { fetchProducts, fetchProduct } from '../thunks';

interface MarketplaceState {
  products: Product[];
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  productLoading: boolean;  // Separate loading state for single product
  productError: string | null;  // Separate error state for single product
  filters: {
    category: string;
    priceRange: [number, number];
    searchTerm: string;
  };
}

const initialState: MarketplaceState = {
  products: [],
  loading: false,
  error: null,
  selectedProduct: null,
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
    // Manual setters for when we have data from other sources
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    // Clear selected product when navigating away
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
      state.productError = null;
    },
    updateFilters: (state, action: PayloadAction<Partial<MarketplaceState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
  },
  // Handle async action states
  extraReducers: (builder) => {
    // Fetch products async actions
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
      })
    
    // Fetch single product async actions
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
  setProducts,
  setLoading,
  setError,
  setSelectedProduct,
  clearSelectedProduct,
  updateFilters,
  addProduct,
  updateProduct,
  removeProduct,
} = marketplaceSlice.actions;

export default marketplaceSlice.reducer; 