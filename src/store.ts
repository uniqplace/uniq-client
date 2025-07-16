import { configureStore } from '@reduxjs/toolkit';
import apiSlice from './api/apiSlice';
import authSliceReducer from "./features/auth/authSlice";
import marketplaceSliceReducer from "./features/marketplace/slices/marketplaceSlice";

export const store = configureStore({
  reducer: {
     auth: authSliceReducer,
      marketplace: marketplaceSliceReducer, 
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  // Add the API middleware to the store
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store 