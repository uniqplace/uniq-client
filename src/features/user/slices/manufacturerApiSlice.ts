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
      query: (userId) => `/manufacturers/${userId}`,
      providesTags: ['ManufacturerProfile'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateManufacturerProfileMutation,
  useUpdateManufacturerProfileByUserIdMutation,
  useGetManufacturerProfileByUserIdQuery,
} = manufacturerApiSlice;
