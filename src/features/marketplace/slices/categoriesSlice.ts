// src/features/categories/categoriesSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Category, SubCategory } from '../../../types/index';

export interface TreeSelectItem {
  label: string;
  value: string;
  children?: TreeSelectItem[];
  count?: number;
}

interface CategoriesState {
  categories: Category[];
  subCategories: SubCategory[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  subCategories: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setSubCategories: (state, action: PayloadAction<SubCategory[]>) => {
      state.subCategories = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (_builder) => {
  },
});

export const { setCategories, setSubCategories, setLoading, setError } = categoriesSlice.actions;

export default categoriesSlice.reducer;


