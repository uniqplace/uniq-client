import apiSlice from './apiSlice';
import type { CreatorProfile } from '../types';

export const creatorProfileApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCreatorProfile: builder.query<{success: boolean; data: CreatorProfile}, string>({
      query: (userId: string) => `/creatorProfile/${userId}`,
    }),
  }),
});

export const { useGetCreatorProfileQuery } = creatorProfileApiSlice;
