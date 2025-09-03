import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Category, Creator, Filters, Product, SubCategory } from '../../../types';
import { fetchCreatorsAndManufacturers, fetchSubCategories } from '../thunks/marketplaceThunks';

interface MarketplaceState {
  selectedProduct: Product | null;
  products: Product[];
  loading: boolean;
  error: string | null;
  productLoading: boolean;
  productError: string | null;
  filters: Filters;
  totalPages: number;
  creators: Array<{ label: string; value: string; avatar?: string }>;
  categories: Category[];
  subCategories: Record<string, SubCategory[]>;
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
    category: '',
    subCategories: [],
    priceRange: [0, 1000],
    searchTerm: '',
  },
  totalPages: 1,
  creators: [],
  categories: [],
  subCategories: {},
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
      // Always sync category and subCategories with selected IDs from URL
      if (action.payload.category !== undefined) {
        state.filters.category = action.payload.category;
        // If category is not set, subCategories should be undefined
        if (!action.payload.category) {
          state.filters.subCategories = undefined;
        } else if (action.payload.subCategories) {
          state.filters.subCategories = action.payload.subCategories;
        }
      } else if (action.payload.subCategories) {
        state.filters.subCategories = action.payload.subCategories;
      }
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = {
        subCategories: undefined,
        category: '',
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
    setProducts(state, action: PayloadAction<Product[]>) {
      state.products = action.payload;
    },
    setCreators: (state, action: PayloadAction<Array<{ label: string; value: string; avatar?: string }>>) => {
      state.creators = action.payload;
    },
    setMaxPrice: (state, action: PayloadAction<number>) => {
      state.maxPrice = action.payload;
    },
    setSubCategories(state, action: PayloadAction<Record<string, SubCategory[]>>) {
      state.subCategories = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreatorsAndManufacturers.fulfilled, (state, action) => {
        const users = Array.isArray(action.payload) ? action.payload : [];
        const creatorOptions = users.map((user: Creator) => ({
          label: user.name,
          value: user._id,
          avatar: user.avatarUrl,
        }));
        state.creators = [...creatorOptions];
      })
      .addCase(fetchSubCategories.fulfilled, (state, action: PayloadAction<Record<string, SubCategory[]>>) => {
        state.subCategories = action.payload;
      })
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