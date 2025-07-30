import apiSlice from '../../../api/apiSlice';
import { type Product } from '../../../types';

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductById: builder.query<Product, string>({
      query: (id) => `/product/${id}`,
      transformResponse: (response : {data:Product}) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
  }),
})
export const {
  useGetProductByIdQuery,
} = productApiSlice;
