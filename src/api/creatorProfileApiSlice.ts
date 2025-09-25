import apiSlice from './apiSlice';
import type { CreatorProfile } from '../types';

export const creatorProfileApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCreatorProfile: builder.query<{success: boolean; data: CreatorProfile}, string>({
      query: (userId: string) => `/creatorProfile/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: 'CreatorProfile', id: userId }],
    }),
    updateCreatorProfile: builder.mutation<{success: boolean; data: CreatorProfile}, { userId: string; data: Partial<CreatorProfile> }>({
      query: ({ userId, data }) => ({
        url: `/creatorProfile/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'CreatorProfile', id: userId }],
    }),
  }),
});

export const { useGetCreatorProfileQuery } = creatorProfileApiSlice;
