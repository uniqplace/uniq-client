import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5002',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
     const state = getState() as Partial<RootState>;
      const token = state?.auth?.token;
      if (!state?.auth) {
        console.warn('Warning: auth slice is missing from the root state!');
      }
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product','Category','SubCategory','Order','User'],
  endpoints: (builder) => ({
    uploadImages: builder.mutation<string[], FormData>({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
    }),
      deleteImages: builder.mutation<any, string[]>({
      query: (imageUrls) => ({
        url: '/upload',
        method: 'DELETE',
        body: imageUrls,
      }),
    }),
  }),
});
export default apiSlice;
export const { useUploadImagesMutation , useDeleteImagesMutation} = apiSlice;
