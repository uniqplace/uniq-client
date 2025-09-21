import { createSlice } from '@reduxjs/toolkit';
import { creatorProfileApiSlice } from './creatorProfileApiSlice';
import type { CreatorProfile } from '../types';

interface CreatorProfileState {
  profile: CreatorProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: CreatorProfileState = {
  profile: null,
  loading: false,
  error: null,
};

const creatorProfileSlice = createSlice({
  name: 'creatorProfile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        creatorProfileApiSlice.endpoints.getCreatorProfile.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        creatorProfileApiSlice.endpoints.getCreatorProfile.matchFulfilled,
        (state, action) => {
          state.loading = false;
          state.profile = action.payload.data;
        }
      )
      .addMatcher(
        creatorProfileApiSlice.endpoints.getCreatorProfile.matchRejected,
        (state, action) => {
          state.loading = false;
          state.error = action.error?.message || 'Failed to fetch creator profile';
        }
      );
  },
});

export const fetchCreatorProfile = creatorProfileApiSlice.endpoints.getCreatorProfile.initiate;
export default creatorProfileSlice.reducer;
