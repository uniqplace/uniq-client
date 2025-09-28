import { createSlice } from '@reduxjs/toolkit';
import { creatorApiSlice } from './creatorApiSlice';
import type { CreatorProfile } from '../../../types';

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

const creatorSlice = createSlice({
  name: 'creatorProfile',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        creatorApiSlice.endpoints.getCreatorProfile.matchPending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        creatorApiSlice.endpoints.getCreatorProfile.matchFulfilled,
        (state, action) => {
          state.loading = false;
          state.profile = action.payload.data;
        }
      )
      .addMatcher(
        creatorApiSlice.endpoints.getCreatorProfile.matchRejected,
        (state, action) => {
          state.loading = false;
          state.error = action.error?.message || 'Failed to fetch creator profile';
        }
      );
  },
});

// Thunk to fetch creator profile using RTK Query's initiate action
export const fetchCreatorProfile = (arg) => (dispatch) => {
  return dispatch(creatorApiSlice.endpoints.getCreatorProfile.initiate(arg));
};
export default creatorSlice.reducer;
