import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ManufacturerPreferences } from './deploySlice';

export const deployApi = createApi({
  reducerPath: 'deployApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_BASE_URL }),
  endpoints: (builder) => ({
    saveManufacturerPreferences: builder.mutation<void, { categoryId: string | null; locationPreference: string | null; priceRange: { min: number; max: number }; deliveryTimeframe: string; deliveryMethod: 'pickup' | 'shipping'; }>({
      query: (preferences) => ({
        url: '/manufacturerPreferences',
        method: 'POST',
        body: preferences,
      }),
    }),
    saveBidRequest: builder.mutation<{ id: string; status: 'open'; createdAt: string }, ManufacturerPreferences & { productId: string }>({
      query: (bidRequest) => ({
        url: '/bid-requests',
        method: 'POST',
        body: bidRequest,
      }),
    }),
  }),
});

export const { useSaveManufacturerPreferencesMutation, useSaveBidRequestMutation } = deployApi;
