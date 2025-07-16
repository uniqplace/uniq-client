// src/features/marketplace/marketplaceApiSlice.ts
import apiSlice from '../../../api/apiSlice';
import type { Product } from '../../../types';

// Query params for fetching products
export interface GetProductsQueryParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  // ניתן להרחיב בעתיד: pagination, sorting וכו'
}

const marketplaceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], GetProductsQueryParams>({
      query: (params) => {
        const cleanParams = Object.fromEntries(
          Object.entries({
            category: params.category,
            minPrice: params.minPrice,
            maxPrice: params.maxPrice,
            q: params.searchTerm,
          }).filter(([_, value]) => value !== undefined)
        );

        return {
          url: '/api/products',
          params: cleanParams,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Product' as const, id: _id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    addProduct: builder.mutation<Product, FormData>({
      query: (formData) => ({
        
        url: '/api/products',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation<Product, Partial<Product>>({
      query: (updatedProduct) => ({
        url: `/api/products/${updatedProduct._id}`,
        method: 'PUT',
        body: updatedProduct,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: 'Product', id: _id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (productId) => ({
        url: `/api/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => `/api/products/${id}`,
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