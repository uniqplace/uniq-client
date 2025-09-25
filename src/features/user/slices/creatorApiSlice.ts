import apiSlice from '../../../api/apiSlice';
import type { CreatorProfile } from '../../../types';


export const creatorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCreatorProfile: builder.query<{success: boolean; data: CreatorProfile}, string>({
      query: (userId: string) => `/creators/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: 'CreatorProfile', id: userId }],
    }),
    updateCreatorProfile: builder.mutation<{success: boolean; data: CreatorProfile}, { userId: string; data: Partial<CreatorProfile> }>({
      query: ({ userId, data }) => ({
        url: `/creators/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'CreatorProfile', id: userId }],
    }),
  }),
});

export const { useGetCreatorProfileQuery } = creatorApiSlice;
