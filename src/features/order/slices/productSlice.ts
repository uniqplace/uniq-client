import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../../types';

interface ProductState {
  product: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  product: null,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProduct(state, action: PayloadAction<Product | null>) {
      state.product = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearProduct(state) {
      state.product = null;
      state.error = null;
    },
  },
});

export const {
  setProduct,
  setLoading,
  setError,
  clearProduct,
} = productSlice.actions;

export default productSlice.reducer;
