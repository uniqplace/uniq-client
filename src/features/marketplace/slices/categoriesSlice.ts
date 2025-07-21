// src/features/categories/categoriesSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ICategory, ISubCategory } from '../../../types/index'; // הנחה שהגדרות אלו נמצאות ב-types.ts

export interface TreeSelectItem {
  label: string;
  value: string;
  children?: TreeSelectItem[];
  count?: number;
}

interface CategoriesState {
  categories: ICategory[];
  subCategories: ISubCategory[];
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
    setCategories: (state, action: PayloadAction<ICategory[]>) => {
      state.categories = action.payload;
    },
    setSubCategories: (state, action: PayloadAction<ISubCategory[]>) => {
      state.subCategories = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
  },
});

export const { setCategories, setSubCategories, setLoading, setError } = categoriesSlice.actions;

export default categoriesSlice.reducer;


