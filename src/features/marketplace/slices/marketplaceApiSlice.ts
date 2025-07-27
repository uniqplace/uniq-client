import apiSlice from '../../../api/apiSlice';
import type { Filters, Product } from '../../../types';

// Utility to create product tags for RTK Query
function getProductTags(result: Product[] | undefined) {
  return result
    ? [
      ...result.map(({ _id }: { _id: string }) => ({ type: "Product" as const, id: _id })),
      { type: "Product" as const, id: "LIST" },
    ]
    : [{ type: "Product" as const, id: "LIST" }];
}

// Shared base query for products endpoints
function getProductsBaseQuery(url: string) {
  return {
    query: (filters: Filters) => ({
      url,
      params: filters,
    }),
    transformResponse: (response: { data: Product[] }) => response.data,
    providesTags: getProductTags,
  };
}

const marketplaceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], Filters>(getProductsBaseQuery('/products')),
    getUserProducts: builder.query<Product[], Filters>(getProductsBaseQuery('/products/user/me')),
    addProduct: builder.mutation<Product, Partial<Product>>({
      query: (formData) => {
        const payload = {
          ...formData,
          subCategories: formData.subCategories,
        };
        return {
          url: '/products',
          method: 'POST',
          body: payload,
        };
      },
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation<Product, Partial<Product>>({
      query: (updatedProduct) => {
        const payload = {
          ...updatedProduct,
          subCategories: updatedProduct.subCategories,
        };
        return {
          url: `/products/${updatedProduct._id}`,
          method: 'PUT',
          body: payload,
        };
      },
      invalidatesTags: (_result, _error, { _id }) => [
        { type: 'Product', id: _id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (productId) => ({
        url: `/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetUserProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
} = marketplaceApiSlice;