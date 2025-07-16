// src/features/auth/authApiSlice.ts
import apiSlice from '../../api/apiSlice';
import { type User } from '../../types/index'; // ודא שנתיב הייבוא נכון
import { setCredentials } from './authSlice';

interface AuthResponse {
  accessToken: string;
  id: string;
  user?: User; 
}

interface RegisterUserPayload {
  username: string;
  email: string;
  password: string;
}
interface LoginUserPayload {
  username: string;
  password: string;
}

const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation<AuthResponse, RegisterUserPayload>({
      query: (registerUser) => ({
        url: "/api/auth/register",
        method: "POST",
        body: registerUser,
      }),
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ accessToken: data.accessToken, id: data.id, user: data.user }));
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),
    login: build.mutation<AuthResponse, LoginUserPayload>({
      query: (loginData) => ({
        url: "/api/auth/login",
        method: "POST",
        body: loginData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ accessToken: data.accessToken, id: data.id, user: data.user }));
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation } = authApiSlice;