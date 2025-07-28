import apiSlice from '../../../api/apiSlice';
import type { ManufacturerPreferences } from './deploySlice';

export const deployApiSlice = apiSlice.injectEndpoints({
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

export const { useSaveManufacturerPreferencesMutation, useSaveBidRequestMutation } = deployApiSlice;
