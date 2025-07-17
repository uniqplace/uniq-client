import marketplaceReducer from './features/marketplace/slices/marketplaceSlice'
import paymentsReducer from './features/payments/slices/paymentsSlice'
import userReducer from './features/marketplace/slices/userSlice'
import { configureStore } from '@reduxjs/toolkit';
import apiSlice from './api/apiSlice';
import authSliceReducer from "./features/auth/authSlice";


export const store = configureStore({
  reducer: {
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