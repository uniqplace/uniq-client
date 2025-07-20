import apiSlice from '../../../api/apiSlice';

export interface CategoryTreeNode {
  key: string;
  label: string;
  children?: CategoryTreeNode[];
}

export const categoriesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategoriesTree: builder.query<CategoryTreeNode[], void>({
      query: () => '/api/subCategories/tree', // הנתיב לראוט שלך בשרת
    }),
  }),
});

export const { useGetCategoriesTreeQuery } = categoriesApiSlice;