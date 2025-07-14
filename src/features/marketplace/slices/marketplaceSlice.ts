import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../../types';

interface MarketplaceState {
  selectedCategory: string | null;
  searchTerm: string;
  selectedProduct: Product | null;
}

const initialState: MarketplaceState = {
  selectedCategory: null,
  searchTerm: '',
  selectedProduct: null,
};

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<string | null>) {
      state.selectedCategory = action.payload;
    },
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
    setSelectedProduct(state, action: PayloadAction<Product | null>) {
      state.selectedProduct = action.payload;
    },
    clearFilters(state) {
      state.selectedCategory = null;
      state.searchTerm = '';
    },
  },
});

export const {
  setCategory,
  setSearchTerm,
  setSelectedProduct,
  clearFilters,
} = marketplaceSlice.actions;

export default marketplaceSlice.reducer;