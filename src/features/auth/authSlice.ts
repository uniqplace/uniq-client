// src/features/auth/authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type User } from '../../types/index';

interface AuthState {
  id: string;
  token: string;
  isUserLoggedIn: boolean;
  user: User | null; 
}

const initialState: AuthState = {
  id: "",
  token: localStorage.getItem("token") || "",
  isUserLoggedIn: !!localStorage.getItem("token"),
  user: null, 
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{id: string; accessToken: string; user?: User}>
    ) => {
      const { accessToken, user ,id} = action.payload;
      state.token = accessToken;
      state.isUserLoggedIn = true;
      state.user = user || null;
      state.id = id;
      localStorage.setItem("token", accessToken);
    },
    removeCredentials: (state) => {
      state.token = "";
      state.id = "";
      state.isUserLoggedIn = false;
      state.user = null;
      localStorage.removeItem("token");
    },
  },
});

export const { setCredentials, removeCredentials } = authSlice.actions;
export default authSlice.reducer;