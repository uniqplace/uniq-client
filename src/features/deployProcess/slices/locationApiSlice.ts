import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const locationApiSlice = createApi({
  reducerPath: 'locationApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_BASE_URL }),
  endpoints: (builder) => ({
    getLocations: builder.query({
      query: () => '/location',
    }),
  }),
});

export const { useGetLocationsQuery } = locationApiSlice;
