import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface PopupState {
  cid: string | null;
}

const initialState: PopupState = {
  cid: null,
};

const popupSlice = createSlice({
  name: 'chatPopup',
  initialState,
  reducers: {
    openPopup: (state, action: PayloadAction<string>) => {
      state.cid = action.payload;
    },
    closePopup: (state) => {
      state.cid = null;
    },
  },
});

export const { openPopup, closePopup } = popupSlice.actions;
export default popupSlice.reducer;
