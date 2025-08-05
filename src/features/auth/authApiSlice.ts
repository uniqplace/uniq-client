import apiSlice from '../../api/apiSlice';
import { type User } from '../../types/index'; 
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
        url: "/auth/register",
        method: "POST",
        body: registerUser,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ accessToken: data.accessToken, id: data.id, user: data.user }));
        } catch (error) {
          console.error("Registration failed:", error);
        }
      },
    }),
    login: build.mutation<AuthResponse, LoginUserPayload>({
      query: (loginData) => ({
        url: "/auth/login",
        method: "POST",
        body: loginData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
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