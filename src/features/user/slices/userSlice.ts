import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchCurrentUser, updateUserProfile } from '../../marketplace/thunks/userThunk'
import type { ManufacturerProfile, RoleType, CreatorProfile } from '../../../types';

export interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  avatar?: string | null;
  avatarUrl?: string | null;
  role: RoleType | null | string;
  bio?: string | null;
  skills?: string[];
  servicesOffered?: string[];
  portfolio?: string[];
  loading: boolean;
  error: string | null;
  rating: number | null;
  manufacturer: ManufacturerProfile | null;
  manufacturerId: string | null;
  creator: CreatorProfile | null;
  creatorId?: string | null;
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  avatar: null,
  avatarUrl: null,
  bio: null,
  role: null,
  loading: false,
  error: null,
  rating: null,
  manufacturer: {} as ManufacturerProfile,
  manufacturerId: null,
  creator: null,
  creatorId: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      Object.assign(state, action.payload);
    },
    clearUser: () => initialState,
    updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
      Object.assign(state, action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    setCreatorProfile: (state, action: PayloadAction<CreatorProfile>) => {
      state.creator = action.payload;
    },
    clearCreatorProfile: (state) => {
      state.creator = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch user';
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        state.loading = false;
        state.creator = action.payload.creatorProfile || null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update profile';
      });
  },
});

export const { setUser, clearUser, updateUser, clearError, setCreatorProfile, clearCreatorProfile } = userSlice.actions;
export default userSlice.reducer;
