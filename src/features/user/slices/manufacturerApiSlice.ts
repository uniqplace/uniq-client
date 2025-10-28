import apiSlice from '../../../api/apiSlice';
import type { ManufacturerProfile } from '../../../types';


export const manufacturerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createManufacturerProfile: builder.mutation<ManufacturerProfile, Partial<ManufacturerProfile>>({
      query: (body) => ({
        url: '/manufacturers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ManufacturerProfile'],
    }),
    updateManufacturerProfileByUserId: builder.mutation<ManufacturerProfile, Partial<ManufacturerProfile> & { userId: string }>({
      query: ({ userId, ...body }) => ({
        url: `/manufacturers/user/${userId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ManufacturerProfile'],
    }),
    getManufacturerProfileByUserId: builder.query<ManufacturerProfile, string>({
      query: (userId) => `/manufacturers/user/${userId}`,
      transformResponse: (response: { data: ManufacturerProfile }) => response.data, // Extract only the `data` field
      providesTags: ['ManufacturerProfile'],
    }),
    // Get suitable manufacturers for a given category
    getSuitableManufacturers: builder.query<ManufacturerProfile[], string>({
      query: (categoryId) => `/manufacturers/suitable?categoryId=${categoryId}`,
      transformResponse: (response: { data: ManufacturerProfile[] }) => response.data,
      providesTags: ['ManufacturerProfile'],
    }),
  }),
});

export const {
  useCreateManufacturerProfileMutation,
  useUpdateManufacturerProfileByUserIdMutation,
  useGetManufacturerProfileByUserIdQuery,
  useGetSuitableManufacturersQuery,
} = manufacturerApiSlice;
