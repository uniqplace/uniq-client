import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ManufacturerProfile } from '../../../types';



interface ManufacturerState {
  profile: ManufacturerProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ManufacturerState = {
  profile: null,
  loading: false,
  error: null,
};

const manufacturerSlice = createSlice({
  name: 'manufacturer',
  initialState,
  reducers: {
    updateManufacturerProfile(state, action: PayloadAction<ManufacturerProfile>) {
      state.profile = action.payload;
    },
    clearManufacturerProfile(state) {
      state.profile = null;
    },
  },
});

export const { updateManufacturerProfile, clearManufacturerProfile } = manufacturerSlice.actions;
export default manufacturerSlice.reducer;
