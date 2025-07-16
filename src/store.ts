import { configureStore, createSlice } from '@reduxjs/toolkit'
import marketplaceReducer from './features/marketplace/slices/marketplaceSlice'
import paymentsReducer from './features/payments/slices/paymentsSlice'
import userReducer from './features/marketplace/slices/userSlice'
import apiSlice from './api/apiSlice';
import authSliceReducer from "./features/auth/authSlice";
import marketplaceSliceReducer from "./features/marketplace/slices/marketplaceSlice";

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1 },
    decrement: (state) => { state.value -= 1 },
  },
})

export const { increment, decrement } = counterSlice.actions

const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    marketplace: marketplaceReducer,
    payments: paymentsReducer,
    user: userReducer,
    auth: authSliceReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,

  },
  // Add the API middleware to the store
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store 