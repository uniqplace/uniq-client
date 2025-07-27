import apiSlice from '../../../api/apiSlice';

export const locationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLocations: builder.query({
      query: () => '/locations',
    }),
  }),
});

export const { useGetLocationsQuery } = locationApiSlice;
