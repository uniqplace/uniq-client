import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5002',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
     // const state = getState() as Partial<RootState>;
      //const token = state?.auth?.token;
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzhmNjIyYTY1ZjlkYTYwMmU4NDdjMCIsImlhdCI6MTc1Mjc1ODM3MCwiZXhwIjoxNzUzMzYzMTcwfQ.Bm9JBhsuTfx3PPStvfQaIARgtUVdOpuu_xW89zAqe0g";
      // if (!state?.auth) {
      //   console.warn('Warning: auth slice is missing from the root state!');
      // }
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product','Category','SubCategory'],
  endpoints: (builder) => ({
    uploadImages: builder.mutation<string[], FormData>({
      query: (formData) => ({
        url: '/api/upload',
        method: 'POST',
        body: formData,
      }),
    }),
      deleteImages: builder.mutation<any, string[]>({
      query: (imageUrls) => ({
        url: '/api/upload',
        method: 'DELETE',
        body: imageUrls,
      }),
    }),
  }),
});
export default apiSlice;
export const { useUploadImagesMutation , useDeleteImagesMutation} = apiSlice;