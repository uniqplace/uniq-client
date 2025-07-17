import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';



interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  avatar?: string | null;
  role: string | null; // הוסף שדה role
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  avatar: null,
  role: null, // הוסף גם כאן
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(_state, action: PayloadAction<UserState>) {
      return action.payload;
    },
    clearUser() {
      return initialState;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
