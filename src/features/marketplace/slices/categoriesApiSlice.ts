import apiSlice from '../../../api/apiSlice';
import type { Category } from '../../../types';

export interface CategoryTreeNode {
  key: string;
  label: string;
  children?: CategoryTreeNode[];
}

export interface CategoryResponse {
  data:Category[],
  success: boolean;
}

export const categoriesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategoriesTree: builder.query<CategoryTreeNode[], void>({
      query: () => '/subCategories/tree',
    }),
    getAllCategories: builder.query<CategoryResponse, void>({
      query: () => '/categories',
    }),
  }),
});

export const { useGetCategoriesTreeQuery, useGetAllCategoriesQuery } = categoriesApiSlice;