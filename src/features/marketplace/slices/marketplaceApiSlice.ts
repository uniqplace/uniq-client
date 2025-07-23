import apiSlice from '../../../api/apiSlice';
import type { Filters, Product } from '../../../types';

const marketplaceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], Filters>({
      query: () => {
        return {
          url: '/products',
        };
      },
      transformResponse: (response: { data: Product[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Product' as const, id: _id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
   getUserProducts: builder.query<Product[], Filters>({
      query: () => {
        return {
          url: '/products/user/me',
        };
      },
      transformResponse: (response: { data: Product[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Product' as const, id: _id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    addProduct: builder.mutation<Product, Partial<Product>>({
      query: (formData) => {
        // Transform category and subCategories to IDs if needed
        const payload = {
          ...formData,
          category:
            typeof formData.category === 'object' && formData.category?._id
              ? formData.category._id
              : formData.category,
          subCategories: Array.isArray(formData.subCategories)
            ? formData.subCategories.map((sub: any) =>
                typeof sub === 'object' && sub._id ? sub._id : sub
              )
            : formData.subCategories,
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
          category:
            typeof updatedProduct.category === 'object' && updatedProduct.category?._id
              ? updatedProduct.category._id
              : updatedProduct.category,
          subCategories: Array.isArray(updatedProduct.subCategories)
            ? updatedProduct.subCategories.map((sub: any) =>
                typeof sub === 'object' && sub._id ? sub._id : sub
              )
            : updatedProduct.subCategories,
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