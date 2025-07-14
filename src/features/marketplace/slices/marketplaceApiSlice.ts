// src/features/marketplace/marketplaceApiSlice.ts
import apiSlice from '../../../api/apiSlice';
import type { Product } from '../../../types';

// Query params for fetching products
export interface GetProductsQueryParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  // Add pagination, sorting, etc. as needed
}

const marketplaceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], GetProductsQueryParams>({
      query: (params) => ({
        url: '/api/products',
        params: {
          category: params.category || undefined,
          minPrice: params.minPrice || undefined,
          maxPrice: params.maxPrice || undefined,
          q: params.searchTerm || undefined,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    addProduct: builder.mutation<Product, Partial<Product>>({
      query: (newProduct) => ({
        url: '/api/product',
        method: 'POST',
        body: newProduct,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation<Product, Partial<Product>>({
      query: (updatedProduct) => ({
        url: `/api/product/${updatedProduct.id}`,
        method: 'PUT',
        body: updatedProduct,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (productId) => ({
        url: `/api/product/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => `/api/product/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
} = marketplaceApiSlice;

export default marketplaceApiSlice;