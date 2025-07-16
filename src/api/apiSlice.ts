import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000',
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
  tagTypes: ['Product'],
  endpoints: () => ({}),
});
export default apiSlice;