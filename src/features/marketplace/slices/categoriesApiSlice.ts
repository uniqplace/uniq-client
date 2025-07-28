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
      query: () => '/categories/tree',
    }),
    getAllCategories: builder.query<CategoryResponse, void>({
      query: () => '/categories',
    }),
    getSubCategoriesByCategory: builder.query<any[], string>({
      query: (categoryId) => ({
        url: `/subCategories/category/${categoryId}`,
      }),
      transformResponse: (response: { data: any[] }) => response.data || response,
      providesTags: (_result, _error, categoryId) => [
        { type: 'SubCategory', id: categoryId },
      ],

    }),
  }),
});

export const {
  useGetCategoriesTreeQuery,
  useGetAllCategoriesQuery,
  useGetSubCategoriesByCategoryQuery,
} = categoriesApiSlice;