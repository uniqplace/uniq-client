import apiSlice from '../../../api/apiSlice';
import type { Filters, Product } from '../../../types';
import type { ProductPayload } from '../../product Idea & AI/slices/aiProductTypes';

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
    getProducts: builder.query<{ data: Product[]; totalPages: number, success: boolean, message: string }, {
      q?: string;
      category?: string;
      subCategories?: string[];
      creator?: string;
      minPrice?: number;
      maxPrice?: number;
      page?: number;
      rating?: number;
      sortBy?: string;
      isMarketplace?: boolean | undefined;
    }>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params.q) query.append('q', params.q);
        if (params.category) query.append('category', params.category);
        if (Array.isArray(params.subCategories) && params.subCategories.length > 0) {
          query.append('subCategories', JSON.stringify(params.subCategories));
        }
        if (params.creator) query.append('creator', params.creator);
        if (typeof params.rating === 'number') query.append('rating', params.rating.toString());
        if (typeof params.minPrice === 'number') query.append('minPrice', params.minPrice.toString());
        if (typeof params.maxPrice === 'number') query.append('maxPrice', params.maxPrice.toString());
        if (params.page) query.append('page', params.page.toString());
        if (params.sortBy) query.append('sortBy', params.sortBy);
        if (typeof params.isMarketplace === 'boolean') query.append('isMarketplace', params.isMarketplace.toString());

        return `/products/search?${query.toString()}`;
      },
    }),
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
      transformResponse: (response: { data: Product }) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
    getSimilarProducts: builder.query<Product[], number[]>({
      query: (embedding) =>{
        return{
          url: `/products/similar`,
          method: 'POST',
          body:  {embedding}
        }
      },
    }),
    createEmbedding: builder.mutation<number[], Partial<ProductPayload>>({
      query: (product) => ({
        url: '/products/embedding',
        method: 'POST',
        body: { product },
      }),
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
  useGetSimilarProductsQuery,
  useCreateEmbeddingMutation,
} = marketplaceApiSlice;