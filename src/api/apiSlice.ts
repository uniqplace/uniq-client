import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    credentials: window.location.hostname !== 'localhost' ? 'omit' : 'include', // ✅ Dynamic credentials
    prepareHeaders: (headers, { getState }) => {
     const state = getState() as Partial<RootState>;
      const token = state?.auth?.token;
      if (!state?.auth) {
      }
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product','Category','SubCategory','Order','User','ManufacturerProfile'],
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
export const {
  useUploadImagesMutation,
  useDeleteImagesMutation,
} = apiSlice;
